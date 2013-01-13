var util = require('util'),
    crypto = require('crypto'),
    Terrain = require('./terrain/terrain'),
    PacketRouter = require('./packetRouter'),
    PacketWriter = require('./network/packetWriter'),
    Encryption = require('./network/encryption'),
    Player = require('./player'),
    EntityManager = require('./EntityManager');

function World() {
    var self = this;
    self.writable = true;
    self.readable = true;
    self.worldTime = new Buffer(8);
    self.worldTime.fill(0);
    self.terrain = new Terrain();
    self.packetRouter = new PacketRouter(self);
    self.encryption = new Encryption();
    self.encryption.init(new Buffer('BurningPig', 'ascii'));

    var packetWriter = new PacketWriter();
    
    self.itemEntities = new EntityManager();
    self.npcEntities = new EntityManager();
    self.playerEntities = new EntityManager();
    
    self.nextEntityId = 1;

    self.startKeepAlives = function () {

        self.keepAliveTimer = setInterval(function () {
            if (self.playerEntities.count() === 0) {
                return;
            }

            self.lastKeepAlive = crypto.randomBytes(4).readInt32BE(0);
            var ka = { keepAliveId: self.lastKeepAlive };

            self.playerEntities.getAll().forEach(function (player, idx) {
                player.pingTimer = process.hrtime();
            });

            var keepAlivePacket = packetWriter.build(0x00, ka);
            self.sendToAllPlayers(keepAlivePacket);

        }, 1000);
    };

    self.startTimeAndClients = function () {
        self.timeTimer = setInterval(function () {
            var timeHigh = self.worldTime.readUInt32BE(0, 4);
            var timeLow = self.worldTime.readUInt32BE(4, 4) + 1;
            if (timeLow & 0xFFFF === 0) {
                timeHigh++;
            }
            self.worldTime.writeUInt32BE(timeHigh, 0);
            self.worldTime.writeUInt32BE(timeLow, 4);

            var dayTime = new Buffer(8);
            dayTime.fill(0);
            dayTime.writeUInt16BE(timeLow % 24000, 6);

            var time = packetWriter.build(0x04, { time: self.worldTime, daytime: dayTime });
            self.sendToAllPlayers(time);

            var packetLength = 0;
            
            self.playerEntities.getAll().forEach(function (player, idx) {
                var cPing = player.getPing();

                var playerlist = packetWriter.build(0xC9, {
                    playerName: player.name,
                    online: true,
                    ping:  cPing > 0x7FFF ? 0x7FFF : cPing
                });
                self.sendToAllPlayers(playerlist);
            });

        }, 50);
    };

    self.write = function (data, encoding) {
        if (data.data === 'end') {
            self.removePlayerFromList(data.player.id);
            console.log('Connection closed!'.red);
            return;
        }

        if (data.data === 'exception') {
            self.removePlayerFromList(data.player.id);
            console.log('Socket Exception: '.red + data.exception);
            data.player.network.end();
            return;
        }

        if (data.data === 'destroyed') {
            self.removePlayerFromList(data.player.id);
            console.log('Connection destroyed!'.red);
            data.player.network.end();
            return;
        }

        //self.packetRouter.process(data);
    };

    self.loadSettings = function () {
        //TODO: check for file first and load defaults if not there.
        self.settings = require('./settings.json');
    };

    self.setupListeners = function(packetStream) {
        packetStream.on('keepalive', self.keepAlive);
        packetStream.on('handshake', self.packetRouter.handShake);
        packetStream.on('chat_message', self.packetRouter.chatMessage);
        packetStream.on('use_entity', self.packetRouter.useEntity);
        packetStream.on('player_base', self.packetRouter.playerBase);
        packetStream.on('player_position', self.packetRouter.playerPosition);
        packetStream.on('player_look', self.packetRouter.playerLook);
        packetStream.on('player_position_look', self.packetRouter.playerPositionLook);
        packetStream.on('player_digging', self.packetRouter.playerDigging);
        packetStream.on('player_block_placement', self.packetRouter.playerBlockPlacement);
        packetStream.on('held_item_change', self.packetRouter.heldItemChange);
        packetStream.on('animation', self.packetRouter.animation);
        packetStream.on('entity_action', self.packetRouter.entityAction);
        packetStream.on('close_window', self.packetRouter.closeWindow);
        packetStream.on('click_window', self.packetRouter.clickWindow);
        packetStream.on('confirm_transaction', self.packetRouter.confirmTransaction);
        packetStream.on('creative_inventory_action', self.packetRouter.creativeInventoryAction);
        packetStream.on('enchant_item', self.packetRouter.enchantItem);
        packetStream.on('update_sign', self.packetRouter.updateSign);
        packetStream.on('player_abilities', self.packetRouter.playerAbilities);
        packetStream.on('tab_complete', self.packetRouter.tabComplete);
        packetStream.on('locale_view_distance', self.packetRouter.localeViewDistance);
        packetStream.on('client_statuses', self.packetRouter.clientStatuses);
        packetStream.on('plugin_message', self.packetRouter.pluginMessage);
        packetStream.on('encryption_response', self.packetRouter.encryptionResponse);
        packetStream.on('server_list_ping', self.serverListPing);
        packetStream.on('disconnect', self.disconnect);
        packetStream.on('end', self.socketClosed);
        packetStream.on('destroy', self.socketClosed);
    };

    self.sendPacket = function(player, packet) {
        player.network.write(packet);
    };

    self.sendToAllPlayers = function (packet) {
        self.playerEntities.getAll().forEach(function (player, idx) {
            player.network.write(packet);
        });
    };

    self.sendToOtherPlayers = function (packet, sourcePlayer) {
        self.playerEntities.getAll().forEach(function (player, idx) {
            if (sourcePlayer.id !== player.id) {
                player.network.write(packet);
            }
        });
    };

    self.sendEntitiesToPlayer = function(targetPlayer) {
        targetPlayer.sendItemEntities(self.itemEntities, packetWriter);
        targetPlayer.sendNpcEntities(self.npcEntities, packetWriter);
        targetPlayer.sendPlayerEntities(self.playerEntities, packetWriter);
    };

    self.protocolCheck = function(protocol, player) {
        if (protocol !== 51) {
            console.log("The client sent a protocol id we don't support: %d".red, protocol);
            var kick = packetWriter.build(0xFF, { serverStatus: 'Sorry, your version of Minecraft needs to be 1.4.7 to use this server!' });
            player.network.write(kick);
            player.network.end();
            return false;
        }

        return true;
    };

    self.serverFullCheck = function (player) {
        if (self.playerEntities.count() === self.settings.maxPlayers) {
            console.log("The server is full!".red);
            var kick = packetWriter.build(0xFF, { serverStatus: 'Sorry, the server is full.' });
            player.network.write(kick);
            player.network.end();
            return false;
        }

        return true;
    };

    self.serverListPing = function (data, player) {
        var serverStatus = ['§1', '51', '1.4.7', self.settings.serverName, self.playerEntities.count(), self.settings.maxPlayers].join('\0');
        var packet = packetWriter.build(0xFF, { serverStatus: serverStatus });

        player.network.write(packet);
        player.network.end();
    };

    self.keepAlive = function (data, player) {
        if (player.closed)
            return;

        player.rawping = process.hrtime(player.pingTimer);

        if (data.keepAliveId === 0) {
            return;
        }

        if (self.lastKeepAlive != data.keepAliveId) {
            console.log('Id: %d - Player sent bad KeepAlive: should have been: %d - was: %d'.red, player.id, player.lastKeepAlive, data.keepAliveId);
            var kick = packetWriter.build(0xFF, { serverStatus: 'Bad response to Keep Alive!' });
            player.network.write(kick);
            player.network.end();
        }
    };

    self.disconnect = function (data, player) {
        //Do stuff like save them to the database.

        self.playerEntities.remove(player.entityId);

        var leavingChat = packetWriter.build(0x03, { message: player.name + ' (' + player.id + ') has left the world!' });
        var clientlist = packetWriter.build(0xC9, {
            playerName: player.name,
            online: false,
            ping: 0
        });

        var destroyEntity = packetWriter.build(0x1D, {
            entityIds: [ player.entityId ]
        });

        self.sendToAllPlayers(clientlist);
        self.sendToAllPlayers(destroyEntity);
        self.sendToAllPlayers(leavingChat);
    };

    self.socketClosed = function(player) {
        console.log('Player connection closed.');
    };
};
module.exports = World;