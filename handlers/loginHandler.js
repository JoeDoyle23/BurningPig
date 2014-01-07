var crypto = require('crypto');
var packets = require('../network/packetList').serverPackets
var loginPackets = require('../network/packetList').serverLoginPackets

var LoginHandler = function (world) {

    world.on('login_start', function (data, player) {
        console.log('Got login request for player: ' + data.name);

        player.handshakeData = data;
        player.token = crypto.randomBytes(4);
        player.id = crypto.randomBytes(4).readUInt32BE(0);

        var encryptionStart = world.packetWriter.buildLogin({
            ptype: loginPackets.EncryptionRequest,
            serverId: world.serverId,
            publicKey: world.encryption.ASN,
            token: player.token
        });

        world.packetSender.sendPacket(player, encryptionStart);
    });

    world.on("encryption_response", function (data, player) {
        var token = world.encryption.decryptSharedSecret(data.token.toString('hex'));
        var secret = world.encryption.decryptSharedSecret(data.sharedSecret.toString('hex'));

        if (player.token.toString('hex') !== token.toString('hex')) {
            var serverStatus = "Encryption setup failed!";
            var packet = world.packetWriter.buildLogin({
                ptype: loginPackets.Disconect,
                reason: serverStatus
            });

            world.packetSender.sendPacket(player, packet);
            world.packetSender.closeConnection(player);
            return;
        }

        world.encryption.validatePlayer(player.handshakeData.name, new Buffer(secret, 'binary'), function(result) {
            if (result.status === 'success') {
                console.log('Validation Response success');
                player.uuid = result.uuid;

                player.network.enableEncryption(secret);
                player.decryptor.enableEncryption(secret);

                var loginSuccess = world.packetWriter.buildLogin({
                    ptype: loginPackets.LoginSuccess,
                    uuid: player.uuid,
                    username: player.handshakeData.name
                });

                world.packetSender.sendPacket(player, loginSuccess);

                player.packetStream.state = 3;
                world.emit('join_game', {}, player);

            } else {
                var serverStatus = "Failed to verify username!";
                var packet = world.packetWriter.buildLogin({
                    ptype: loginPackets.Disconnect,
                    reason: serverStatus
                });

                world.packetSender.sendPacket(player, packet);
                world.packetSender.closeConnection(player);
            }
        });
    });

    world.on("join_game", function (data, player) {
        player.name = player.handshakeData.name;
        delete player.handshakeData;

        player.entityId = world.nextEntityId++;
        var joinGame = world.packetWriter.build({
            ptype: packets.JoinGame,
            entityId: player.entityId,
            gameMode: world.settings.gameMode,
            dimension: world.settings.dimension,
            difficulty: world.settings.difficulty,
            maxPlayers: world.settings.maxPlayers
        });
        player.network.write(joinGame);

        var playerAbsolutePosition = player.getAbsolutePosition();
        var spawnPosition = world.packetWriter.build({
            ptype: packets.SpawnPosition,
            x: playerAbsolutePosition.x,
            y: playerAbsolutePosition.y,
            z: playerAbsolutePosition.z,
        });
        player.network.write(spawnPosition);

        var playerAbilities = world.packetWriter.build({
            ptype: packets.PlayerAbilities,
            flags: 0,
            flyingSpeed: 0.05,
            walkingSpeed: 0.1
        });
        player.network.write(playerAbilities);

        console.log('New Player Id: %d EntityId: %d'.yellow, player.id, player.entityId);
        world.playerEntities.add(player);
        console.log('World Status: Players: %d'.yellow, world.playerEntities.count());

        var playerPosLook = player.getPositionLook();

        var namedEntity = world.packetWriter.build({
            ptype: packets.SpawnPlayer,
            entityId: player.entityId,
            playerUUID: '',
            playerName: player.name,
            x: playerAbsolutePosition.x,
            y: playerAbsolutePosition.y,
            z: playerAbsolutePosition.z,
            yaw: playerAbsolutePosition.yaw,
            pitch: playerAbsolutePosition.pitch,
            currentItem: 0,
            metadata: []
        });

        world.packetSender.sendToOtherPlayers(namedEntity, player);
        //world.sendEntitiesToPlayer(player);

        console.log('%s (%d) has joined the world!', player.name, player.id);

        var message = {
            text: player.name + ' (' + player.id + ') has joined the world!'
        };

        var welcomeChat = world.packetWriter.build({
            ptype: packets.ChatMessage,
            message: JSON.stringify(message)
        });
        world.packetSender.sendToAllPlayers(welcomeChat);

        playerPosLook.ptype = packets.PlayerPositionAndLook;
        var pos = world.packetWriter.build(playerPosLook);

        world.terrain.getMapPacket(function(mapdata) {
            mapdata.ptype = packets.MapChunkBulk;
            var map = world.packetWriter.build(mapdata);
            world.packetSender.sendPacket(player, map);
            world.packetSender.sendPacket(player, pos);
        });
    });

    world.on("client_settings", function (data, player) {
        console.log(data);
    });

    world.on("client_status", function (data, player) {
        console.log('client_status');
    });
};

module.exports = LoginHandler;