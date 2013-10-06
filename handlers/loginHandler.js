var crypto = require('crypto');

var LoginHandler = function(world) {

    world.on("handshake", function(data, player) {
        //console.log('Got handshake from user: ' + data.username);

        if(!protocolCheck(data.protocol, player, world)) {
          return;
        }

        if (!serverFullCheck(player, world)) {
          return;
        }
        
        player.token = crypto.randomBytes(4);
        player.id = crypto.randomBytes(4).readUInt32BE(0);

        player.handshakeData = data;

        var encryptionStart = world.packetWriter.build({
            ptype: 0xFD, 
            serverId: '-',
            publicKey: world.encryption.ASN,
            token: player.token
        });

        world.packetSender.sendPacket(player, encryptionStart);
    });

    world.on("client_statuses", function(data, player) {
        if(data.payload !== 0) {
            console.log('Hmm, the player send data in the 0xCD other than 0.'.red);
        }

        var handshakeData = player.handshakeData;
        delete player.handshakeData;

        player.name = handshakeData.username;
        player.entityId = world.nextEntityId++;
        
        console.log('New Player Id: %d EntityId: %d'.yellow, player.id, player.entityId);
        world.playerEntities.add(player);
        console.log('World Status: Players: %d'.yellow, world.playerEntities.count());

        var packet = world.packetWriter.build({
            ptype: 0x01, 
            entityId: player.entityId,
            gameMode: world.settings.gameMode,
            dimension: world.settings.dimension,
            difficulty: world.settings.difficulty,
            maxPlayers: world.settings.maxPlayers
        });
        player.network.write(packet);

        var playerPosLook = player.getPositionLook();
        var playerAbsolutePosition = player.getAbsolutePosition();
        
        var namedEntity = world.packetWriter.build({
            ptype: 0x14, 
            entityId: player.entityId,
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
        world.sendEntitiesToPlayer(player);

        console.log('%s (%d) has joined the world!', player.name, player.id);

        var message = {
            translate:"chat.type.announcement",
            using: ["Server", player.name + ' (' + player.id + ') has joined the world!']
        };

        var welcomeChat = world.packetWriter.build({ ptype: 0x03, message: JSON.stringify(message)});
        world.packetSender.sendToAllPlayers(welcomeChat);

        playerPosLook.ptype = 0x0D;
        var pos = world.packetWriter.build(playerPosLook);

        world.terrain.getMapPacket(function(mapdata) {
            mapdata.ptype = 0x38;
            var map = world.packetWriter.build(mapdata);
            world.packetSender.sendPacket(player, map);
            world.packetSender.sendPacket(player, pos);
        });
    });

    world.on("encryption_response", function(data, player) {
        //console.log('Got encryption response');

        var token = world.encryption.decryptSharedSecret(data.token.toString('hex'));
        var secret = world.encryption.decryptSharedSecret(data.sharedSecret.toString('hex'));

        if(player.token.toString('hex') !== token.toString('hex')) {
            var serverStatus = "Encryption setup failed!";
            var packet = world.packetWriter.build({ ptype: 0xFF, serverStatus: serverStatus });

            world.packetSender.sendPacket(player, packet);
            world.packetSender.closeConnection(player);
            return;
        }

        world.encryption.validatePlayer(player.handshakeData.username, new Buffer(secret, 'binary'), function(result) {
            if(result==='YES') {
                var encryptionAccepted = world.packetWriter.build({ ptype: 0xFC});
                world.packetSender.sendPacket(player, encryptionAccepted);

                player.network.enableEncryption(secret);
                player.decryptor.enableEncryption(secret);                
            } else {
                var serverStatus = "Failed to verify username!";
                var packet = world.packetWriter.build({ ptype: 0xFF, serverStatus: serverStatus });

                world.packetSender.sendPacket(player, packet);
                world.packetSender.closeConnection(player);
            }
        });
    });
};

function protocolCheck(protocol, player, world) {
    if (protocol !== 78) {
        console.log("The client sent a protocol id we don't support: %d".red, protocol);
        var kick = world.packetWriter.build({ ptype: 0xFF, serverStatus: 'Sorry, your version of Minecraft needs to be 1.6.4 to use this server!' });
        world.packetSender.sendPacker(player, kick);
        world.packetSender.closeConnection(player);
        return false;
    }

    return true;
};


function serverFullCheck(player, world) {
    if (world.playerEntities.count() === world.settings.maxPlayers) {
        console.log("The server is full!".red);
        var kick = world.packetWriter.build({ ptype: 0xFF, serverStatus: 'Sorry, the server is full.' });
        world.packetSender.sendPacket(player, kick);
        world.packetSender.closeConnection(player);
        return false;
    }

    return true;
};


module.exports = LoginHandler;