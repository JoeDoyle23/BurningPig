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

    this.handShake = function (data, player) {
        //console.log('Got handshake from user: ' + data.username);

        if(!self.world.protocolCheck(data.protocol, player)) {
          return;
        }

        if (!self.world.serverFullCheck(player)) {
          return;
        }
        
        player.token = crypto.randomBytes(4);
        player.id = crypto.randomBytes(4).readUInt32BE(0);

        player.handshakeData = data;

        var encryptionStart = packetWriter.build(0xFD, {
            serverId: 'BurningPig',
            publicKey: self.world.encryption.ASN,
            token: player.token
        });

        player.network.write(encryptionStart);
    };

    this.chatMessage = function (data, player) {
        if (data.message.length > 100)
            data.message = data.message.slice(0, 100);


        var chat = packetWriter.build(0x03, { message: player.name + ': ' + data.message });
        self.world.sendToAllPlayers(chat);
    };

    this.useEntity = function (data, player) {
        console.log('Got useEntity, need to add code!'.red);
    };

    this.playerBase = function (data, player) {
        var goodUpdate = player.updatePosition(data);
        if (goodUpdate) {
            var position = player.getPositionLook();
            var update = packetWriter.build(0x0D, {
                entityId: player.entityId,
                x: position.x,
                y: position.y,
                z: position.z,
                stance: position.stance,
                yaw: position.yaw,
                pitch: position.pitch,
                onGround: position.onGround
            });
            self.world.sendToOtherPlayers(update, player);
        }
    };

    this.playerPosition = function (data, player) {
        var goodUpdate = player.updatePosition(data);
        if (goodUpdate) {
            var position = player.getAbsoluteDelta();
            var update = packetWriter.build(0x1F, {
                entityId: player.entityId,
                dX: position.x,
                dY: position.y,
                dZ: position.z,
            });
            self.world.sendToOtherPlayers(update, player);
        }
    };

    this.playerLook = function (data, player) {
        var goodUpdate = player.updatePosition(data);
        if (goodUpdate) {
            var position = player.getAbsoluteDelta();
            var update = packetWriter.build(0x20, {
                entityId: player.entityId,
                yaw: position.yaw,
                pitch: position.pitch,
            });

            var headLook = packetWriter.build(0x23, {
                entityId: player.entityId,
                headYaw: position.yaw,
            });

            self.world.sendToOtherPlayers(Buffer.concat([update, headLook], update.length+headLook.length), player);
        }
    };

    this.playerPositionLook = function (data, player) {
        var goodUpdate = player.updatePosition(data);
        if (goodUpdate) {
            var position = player.getAbsoluteDelta();
            var update = packetWriter.build(0x21, {
                entityId: player.entityId,
                dX: position.x,
                dY: position.y,
                dZ: position.z,
                yaw: position.yaw,
                pitch: position.pitch,
            });
            self.world.sendToOtherPlayers(update, player);
        }
    };

    this.playerDigging = function (data, player) {
        if (data.status === 0) {
            //console.log('Player started digging'.magenta);
            player.digging = {
                Start: process.hrtime(),
                x: data.x,
                y: data.y,
                z: data.z,
                face: data.face
            };

        }
        if (data.status === 2) {
            //console.log('Player stopped digging'.magenta);

            if(!player.validateDigging(data)) {
                player.digging = null;
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

            var entity = {
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
            };

            self.world.itemEntities.add(entity);
            var spawnEntity = packetWriter.build(0x15, entity);

            self.world.sendToAllPlayers(dugPacket);
            self.world.sendToAllPlayers(spawnEntity);
        }
    };

    this.playerBlockPlacement = function (data, player) {
        console.log('Got playerBlockPlacement, need to add code!'.red);
    };

    this.heldItemChange = function (data, player) {
        player.activeSlot = data.slotId;

        var entityHolding = packetWriter.build(0x05, {
            entityId: player.entityId,
            slot: 0,
            item: { blockId: -1 }
        });

        self.world.sendToOtherPlayers(enityHolding);
    };

    this.animation = function (data, player) {
        var packet = packetWriter.build(0x12, {
            entityId: data.entityId,
            animation: data.animation
        });
        self.world.sendToOtherPlayers(packet, player);
    };

    this.entityAction = function (data, player) {
        console.log('Got entityAction, need to add code!'.red);
    };

    this.closeWindow = function (data, player) {
        console.log('Got closeWindow, need to add code!'.red);
    };

    this.clickWindow = function (data, player) {
        console.log('Got clickWindow, need to add code!'.red);
    };

    this.confirmTransaction = function (data, player) {
        console.log('Got confirmTransaction, need to add code!'.red);
    };

    this.creativeInventoryAction = function (data, player) {
        console.log('Got creativeInventoryAction, need to add code!'.red);
    };

    this.enchantItem = function (data, player) {
        console.log('Got enchantItem, need to add code!'.red);
    };

    this.updateSign = function (data, player) {
        console.log('Got updateSign, need to add code!'.red);
    };

    this.playerAbilities = function (data, player) {
        console.log('Got playerAbilities, need to add code!'.red);
    };

    this.tabComplete = function (data, player) {
        console.log('Got tabComplete, need to add code!'.red);
    };

    this.localeViewDistance = function (data, player) {
        console.log('Got localeViewDistance, need to add code!'.red);
    };

    this.clientStatuses = function (data, player) {
        if(data.payload !== 0) {
            console.log('Hmm, the player send data in the 0xCD other than 0.'.red);
        }

        var handshakeData = player.handshakeData;

        player.name = handshakeData.username;
        player.entityId = self.world.nextEntityId++;
        
        console.log('New Player Id: %d EntityId: %d'.yellow, player.id, player.entityId);
        console.log('World Status: Players: %d'.yellow, self.world.players.length);

        var packet = packetWriter.build(0x01, {
            entityId: player.entityId,
            gameMode: self.world.settings.gameMode,
            dimension: self.world.settings.dimension,
            difficulty: self.world.settings.difficulty,
            maxPlayers: self.world.settings.maxPlayers
        });
        player.network.write(packet);

        var playerPosLook = player.getPositionLook();
        var playerAbsolutePosition = player.getAbsolutePosition();
        
        var namedEntity = packetWriter.build(0x14, {
            entityId: player.entityId,
            playerName: player.name,
            x: playerAbsolutePosition.x,
            y: playerAbsolutePosition.y,
            z: playerAbsolutePosition.z,
            yaw: playerAbsolutePosition.yaw,
            pitch: playerAbsolutePosition.pitch,
            currentItem: 0
        });

        self.world.players.push(player);
        self.world.playerEntities.add(player);

        self.world.sendToOtherPlayers(namedEntity, player);
        self.world.sendEntitiesToPlayer(player);

        console.log('%s (%d) has joined the world!', handshakeData.username, player.id);
        var welcomeChat = packetWriter.build(0x03, { message: handshakeData.username + ' (' + player.id + ') has joined the world!' });
        self.world.sendToAllPlayers(welcomeChat);

        var pos = packetWriter.build(0x0D, playerPosLook);

        self.world.terrain.getMapPacket(function(mapdata) {
            var map = packetWriter.build(0x38, mapdata);
            player.network.write(map);
            player.network.write(pos);
        });

    };

    this.pluginMessage = function (data, player) {
        console.log('Got pluginMessage, need to add code!'.red);
    };

    this.encryptionResponse = function (data, player) {
        //console.log('Got encryption response');

        var token = self.world.encryption.decryptSharedSecret(data.token.toString('hex'));
        var secret = self.world.encryption.decryptSharedSecret(data.sharedSecret.toString('hex'));

        if(player.token.toString('hex') !== token.toString('hex')) {
            var serverStatus = "Encryption setup failed!";
            var packet = packetWriter.build(0xFF, { serverStatus: serverStatus });

            player.network.write(packet);
            player.network.end();
            return;
        }

        self.world.encryption.validatePlayer(player.handshakeData.username, new Buffer(secret, 'binary'), function(result) {
            if(result==='YES') {
                var encryptionAccepted = packetWriter.build(0xFC, {});
                player.network.write(encryptionAccepted);

                player.network.enableEncryption(secret);
                player.decryptor.enableEncryption(secret);                
            } else {
                var serverStatus = "Failed to verify username!";
                var packet = packetWriter.build(0xFF, { serverStatus: serverStatus });

                player.network.write(packet);
                player.network.end();
            }
        });
    };

    this.disconnect = function (data, player) {
        console.log('Got disconnect, need to add code!'.red);
    };
};
util.inherits(PacketRouter, EventEmitter);


module.exports = PacketRouter;