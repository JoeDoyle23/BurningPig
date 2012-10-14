var util = require('util'),
    crypto = require('crypto'),
    EventEmitter = require('events').EventEmitter,
    PacketWriter = require('./network/packetWriter'),
    Player = require('./player'),
    blockDrops = require('./blockMapping'),
    CommandHandler = require('./CommandHandler');
  
function PacketRouter(world) {
    EventEmitter.call(this);
    this.world = world;

    var self = this;
    var packetWriter = new PacketWriter();

    this.handShake = function (data, client) {
        //console.log('Got handshake from user: ' + data.username);

        if(!self.world.protocolCheck(data.protocol, client)) {
          return;
        }

        if (!self.world.serverFullCheck(client)) {
          return;
        }
        
        client.token = crypto.randomBytes(4);
        client.id = crypto.randomBytes(4).readUInt32BE(0);

        client.handshakeData = data;

        var encryptionStart = packetWriter.build(0xFD, {
            serverId: 'BurningPig',
            publicKey: self.world.encryption.ASN,
            token: client.token
        });

        client.network.write(encryptionStart);
    };

    this.chatMessage = function (data, client) {
        if (data.message.length > 100)
            data.message = data.message.slice(0, 100);
        var chat = packetWriter.build(0x03, { message: client.player.name + ': ' + data.message });
        self.world.sendToAllPlayers(chat);
    };

    this.useEntity = function (data, client) {
        console.log('Got useEntity, need to add code!'.red);
    };

    this.playerBase = function (data, client) {
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
            self.world.sendToOtherPlayers(update, client);
        }
    };

    this.playerPosition = function (data, client) {
        var goodUpdate = client.player.updatePosition(data);
        if (goodUpdate) {
            var position = client.player.getAbsoluteDelta();
            var update = packetWriter.build(0x1F, {
                entityId: client.player.entityId,
                dX: position.x,
                dY: position.y,
                dZ: position.z,
            });
            self.world.sendToOtherPlayers(update, client);
        }
    };

    this.playerLook = function (data, client) {
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

            self.world.sendToOtherPlayers(Buffer.concat([update, headLook], update.length+headLook.length), client);
        }
    };

    this.playerPositionLook = function (data, client) {
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
            self.world.sendToOtherPlayers(update, client);
        }
    };

    this.playerDigging = function (data, client) {
        if (data.status === 0) {
            //console.log('Player started digging'.magenta);
            client.player.digging = {
                Start: process.hrtime(),
                x: data.x,
                y: data.y,
                z: data.z,
                face: data.face
            };

        }
        if (data.status === 2) {
            //console.log('Player stopped digging'.magenta);

            if(!client.player.validateDigging(data)) {
                client.player.digging = null;
                return;
            }

            var blockPosition = { x: data.x, y: data.y, z: data.z };
            var dugBlock = self.world.terrain.getBlock(blockPosition);

            var digResult = blockDrops[dugBlock.blockType];

            self.world.terrain.setBlock(blockPosition, { blockType: 0, metadata: 0, light: 0, skylight: 0x00 });

            var dugPacket = packetWriter.build(0x35, {
                x: data.x,
                y: data.y,
                z: data.z,
                blockType: 0,
                blockMetadata: 0
            });

            var spawnEntity = packetWriter.build(0x15, {
                entityId: self.world.nextEntityId++,
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

            self.world.sendToAllPlayers(dugPacket);
            self.world.sendToAllPlayers(spawnEntity);
        }
    };

    this.playerBlockPlacement = function (data, client) {
        console.log('Got playerBlockPlacement, need to add code!'.red);
    };

    this.heldItemChange = function (data, client) {
        client.player.activeSlot = data.slotId;

        var entityHolding = packetWriter.build(0x05, {
            entityId: client.player.entityId,
            slot: 0,
            item: { blockId: -1 }
        });

        self.world.sendToOtherPlayers(enityHolding);
    };

    this.animation = function (data, client) {
        var packet = packetWriter.build(0x12, {
            entityId: data.entityId,
            animation: data.animation
        });
        self.world.sendToOtherPlayers(packet, client);
    };

    this.entityAction = function (data, client) {
        console.log('Got entityAction, need to add code!'.red);
    };

    this.closeWindow = function (data, client) {
        console.log('Got closeWindow, need to add code!'.red);
    };

    this.clickWindow = function (data, client) {
        console.log('Got clickWindow, need to add code!'.red);
    };

    this.confirmTransaction = function (data, client) {
        console.log('Got confirmTransaction, need to add code!'.red);
    };

    this.creativeInventoryAction = function (data, client) {
        console.log('Got creativeInventoryAction, need to add code!'.red);
    };

    this.enchantItem = function (data, client) {
        console.log('Got enchantItem, need to add code!'.red);
    };

    this.updateSign = function (data, client) {
        console.log('Got updateSign, need to add code!'.red);
    };

    this.playerAbilities = function (data, client) {
        console.log('Got playerAbilities, need to add code!'.red);
    };

    this.tabComplete = function (data, client) {
        console.log('Got tabComplete, need to add code!'.red);
    };

    this.localeViewDistance = function (data, client) {
        console.log('Got localeViewDistance, need to add code!'.red);
    };

    this.clientStatuses = function (data, client) {
        if(data.payload !== 0) {
            console.log('Hmm, the client send data in the 0xCD other than 0.'.red);
        }

        var handshakeData = client.handshakeData;

        client.player = new Player(client);
        client.player.name = handshakeData.username;
        client.player.entityId = self.world.nextEntityId++;
        
        console.log('New Player Id: %d EntityId: %d'.yellow, client.id, client.player.entityId);
        console.log('World Status: Players: %d'.yellow, self.world.players.length);

        var packet = packetWriter.build(0x01, {
            entityId: client.player.entityId,
            gameMode: self.world.settings.gameMode,
            dimension: self.world.settings.dimension,
            difficulty: self.world.settings.difficulty,
            maxPlayers: self.world.settings.maxPlayers
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

        self.world.players.push(client);
        self.world.entities[client.player.entityId] = client.player;

        self.world.sendToOtherPlayers(namedEntity, client);
        self.world.sendEntitiesToPlayer(client);

        console.log('%s (%d) has joined the world!', handshakeData.username, client.id);
        var welcomeChat = packetWriter.build(0x03, { message: handshakeData.username + ' (' + client.id + ') has joined the world!' });
        self.world.sendToAllPlayers(welcomeChat);

        var pos = packetWriter.build(0x0D, playerPosLook);

        self.world.terrain.getMapPacket(function(mapdata) {
            var map = packetWriter.build(0x38, mapdata);
            client.network.write(map);
            client.network.write(pos);
        });

    };

    this.pluginMessage = function (data, client) {
        console.log('Got pluginMessage, need to add code!'.red);
    };

    this.encryptionResponse = function (data, client) {
        //console.log('Got encryption response');

        var token = self.world.encryption.decryptSharedSecret(data.token.toString('hex'));
        var secret = self.world.encryption.decryptSharedSecret(data.sharedSecret.toString('hex'));

        if(client.token.toString('hex') !== token.toString('hex')) {
            var serverStatus = "Encryption setup failed!";
            var packet = packetWriter.build(0xFF, { serverStatus: serverStatus });

            client.network.write(packet);
            client.network.end();
            return;
        }

        self.world.encryption.validatePlayer(client.handshakeData.username, new Buffer(secret, 'binary'), function(result) {
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

    this.disconnect = function (data, client) {
        console.log('Got disconnect, need to add code!'.red);
    };
};
util.inherits(PacketRouter, EventEmitter);


module.exports = PacketRouter;