var util = require('util')
  , crypto = require('crypto')
  , PacketWriter = require('./network/packetWriter')
  , Player = require('./player')
  , blockDrops = require('./blockMapping');
  
function PacketHandler(world) {

    var packetHandler = [];
    var packetWriter = new PacketWriter();

    packetHandler[0x00] = function (data, client) {
        if (client.closed)
            return;

        client.player.rawping = process.hrtime(client.player.pingTimer);

        if (data.keepAliveId === 0) {
            return;
        }

        if (world.lastKeepAlive != data.keepAliveId) {
            console.log('Id: %d - Client sent bad KeepAlive: should have been: %d - was: %d'.red, client.id, client.lastKeepAlive, data.keepAliveId);
            var kick = packetWriter.build(0xFF, { serverStatus: 'Bad response to Keep Alive!' });
            client.network.write(kick);
            client.network.end();
        }
    };

    packetHandler[0x02] = function (data, client) {
        //console.log('Got handshake from user: ' + data.username);

        if(!world.protocolCheck(data.protocol, client)) {
          return;
        }

        if (!world.serverFullCheck(client)) {
          return;
        }
        
        client.token = crypto.randomBytes(4);
        client.id = crypto.randomBytes(4).readUInt32BE(0);

        client.handshakeData = data;

        var encryptionStart = packetWriter.build(0xFD, {
            serverId: 'BurningPig',
            publicKey: world.encryption.ASN,
            token: client.token
        });

        client.network.write(encryptionStart);
    };

    packetHandler[0x03] = function (data, client) {
        if (data.message.length > 100)
            data.message = data.message.slice(0, 100);
        var chat = packetWriter.build(0x03, { message: client.player.name + ': ' + data.message });
        world.sendToAllPlayers(chat);
    };

    packetHandler[0x0A] = function (data, client) {
        var goodUpdate = client.player.updatePosition(data);
        if (goodUpdate) {
            var position = client.player.getPositionLook();
            var update = packetWriter.build(0x0D, {
                entityId: client.player.entityId,
                x: position.x,
                y: position.y,
                z: position.z,
                stance: position.stance,
                yaw: position.yaw,
                pitch: position.pitch,
                onGround: position.onGround
            });
            world.sendToOtherPlayers(update, client);
        }
    };

    packetHandler[0x0B] = function (data, client) {
        var goodUpdate = client.player.updatePosition(data);
        if (goodUpdate) {
            var position = client.player.getAbsoluteDelta();
            var update = packetWriter.build(0x1F, {
                entityId: client.player.entityId,
                dX: position.x,
                dY: position.y,
                dZ: position.z,
            });
            world.sendToOtherPlayers(update, client);
        }
    };

    packetHandler[0x0C] = function (data, client) {
        var goodUpdate = client.player.updatePosition(data);
        if (goodUpdate) {
            var position = client.player.getAbsoluteDelta();
            var update = packetWriter.build(0x20, {
                entityId: client.player.entityId,
                yaw: position.yaw,
                pitch: position.pitch,
            });

            var headLook = packetWriter.build(0x23, {
                entityId: client.player.entityId,
                headYaw: position.yaw,
            });

            world.sendToOtherPlayers(Buffer.concat([update, headLook], update.length+headLook.length), client);
        }
    };

    packetHandler[0x0D] = function (data, client) {
        var goodUpdate = client.player.updatePosition(data);
        if (goodUpdate) {
            var position = client.player.getAbsoluteDelta();
            var update = packetWriter.build(0x21, {
                entityId: client.player.entityId,
                dX: position.x,
                dY: position.y,
                dZ: position.z,
                yaw: position.yaw,
                pitch: position.pitch,
            });
            world.sendToOtherPlayers(update, client);
        }
    };

    packetHandler[0x0E] = function (data, client) {

        if (data.status === 0) {
            console.log('Player started digging'.magenta);
            client.player.digging = {
                Start: process.hrtime(),
                x: data.x,
                y: data.y,
                z: data.z,
                face: data.face
            };

        }
        if (data.status === 2) {
            console.log('Player stopped digging'.magenta);

            var digGood = client.player.validateDigging(data);

            var blockPosition = { x: data.x, y: data.y, z: data.z };
            console.log(blockPosition);
            var dugBlock = world.terrain.getBlock(blockPosition);

            var digResult = blockDrops[dugBlock.blockType];

            world.terrain.setBlock(blockPosition, { blockType: 0, metadata: 0, light: 0, skylight: 0xFF });

            var dugPacket = packetWriter.build(0x35, {
                x: data.x,
                y: data.y,
                z: data.z,
                blockType: 0,
                blockMetadata: 0
            });

            var spawnEntity = packetWriter.build(0x15, {
                entityId: world.nextEntityId++,
                itemId: digResult.itemId,
                count: digResult.count,
                data: 0,
                x: (blockPosition.x + 0.5) * 32,
                y: (blockPosition.y + 0.5) * 32,
                z: (blockPosition.z + 0.5) * 32,
                rotation: 0,
                pitch: 0,
                roll: 0
            });

            world.sendToAllPlayers(dugPacket);
            world.sendToAllPlayers(spawnEntity);
        }
    };

    packetHandler[0x10] = function (data, client) {
        client.player.activeSlot = data.slotId;

        var entityHolding = packetWriter.build(0x05, {
            entityId: client.player.entityId,
            slot: 0,
            item: { blockId: -1 }
        });

        world.sendToOtherPlayers(enityHolding);
    };

    packetHandler[0x12] = function (data, client) {
        var packet = packetWriter.build(0x12, {
            entityId: data.entityId,
            animation: data.animation
        });
        world.sendToOtherPlayers(packet, client);
    };

    packetHandler[0xCC] = function (data, client) {
        //console.log('ID: %d Got client info data: ' + util.inspect(data, true, null, true), client.id);
    };

    packetHandler[0xCD] = function (data, client) {
        if(data.payload !== 0) {
            console.log('Hmm, the client send data in the 0xCD other than 0.'.red);
        }

        var handshakeData = client.handshakeData;

        client.player = new Player(client);
        client.player.name = handshakeData.username;
        client.player.entityId = world.nextEntityId++;
        
        console.log('New Player Id: %d EntityId: %d'.yellow, client.id, client.player.entityId);
        console.log('World Status: Players: %d'.yellow, world.players.length);

        var packet = packetWriter.build(0x01, {
            entityId: client.player.entityId,
            gameMode: world.settings.gameMode,
            dimension: world.settings.dimension,
            difficulty: world.settings.difficulty,
            maxPlayers: world.settings.maxPlayers
        });
        client.network.write(packet);

        var playerPosLook = client.player.getPositionLook();
        var playerAbsolutePosition = client.player.getAbsolutePosition();
        
        var namedEntity = packetWriter.build(0x14, {
            entityId: client.player.entityId,
            playerName: client.player.name,
            x: playerAbsolutePosition.x,
            y: playerAbsolutePosition.y,
            z: playerAbsolutePosition.z,
            yaw: playerAbsolutePosition.yaw,
            pitch: playerAbsolutePosition.pitch,
            currentItem: 0
        });

        world.players.push(client);
        world.entities[client.player.entityId] = client.player;

        world.sendToOtherPlayers(namedEntity, client);
        world.sendEntitiesToPlayer(client);

        console.log('%s (%d) has joined the world!', handshakeData.username, client.id);
        var welcomeChat = packetWriter.build(0x03, { message: handshakeData.username + ' (' + client.id + ') has joined the world!' });
        world.sendToAllPlayers(welcomeChat);

        var pos = packetWriter.build(0x0D, playerPosLook);

        world.terrain.getMapPacket(function(mapdata) {
            var map = packetWriter.build(0x38, mapdata);
            client.network.write(map);
            client.network.write(pos);
        });

    };

    packetHandler[0xFC] = function (data, client) {
        //console.log('Got encryption response');

        var token = world.encryption.decryptSharedSecret(data.token.toString('hex'));
        var secret = world.encryption.decryptSharedSecret(data.sharedSecret.toString('hex'));

        if(client.token.toString('hex') !== token.toString('hex')) {
            var serverStatus = "Encryption setup failed!";
            var packet = packetWriter.build(0xFF, { serverStatus: serverStatus });

            client.network.write(packet);
            client.network.end();
            return;
        }

        world.encryption.validatePlayer(client.handshakeData.username, new Buffer(secret, 'binary'), function(result) {
            if(result==='YES') {
                var encryptionAccepted = packetWriter.build(0xFC, {});
                client.network.write(encryptionAccepted);

                client.network.enableEncryption(secret);
                client.decryptor.enableEncryption(secret);                
            } else {
                var serverStatus = "Failed to verify username!";
                var packet = packetWriter.build(0xFF, { serverStatus: serverStatus });

                client.network.write(packet);
                client.network.end();
            }
        });
    };

    packetHandler[0xFE] = function (data, client) {
        var serverStatus = world.settings.serverName + '§' + world.players.length + '§' + world.settings.maxPlayers;
        var packet = packetWriter.build(0xFF, { serverStatus: serverStatus });

        client.network.write(packet);
        client.network.end();
    };

    this.process = function (data) {
        if (packetHandler.hasOwnProperty(data.data.type)) {
            packetHandler[data.data.type](data.data, data.client);
        } else {
            console.log("Got unhandled data: ".red + util.inspect(data.data, true, null, true));
        }
    }
};

module.exports = PacketHandler;