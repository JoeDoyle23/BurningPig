var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Terrain = require('./terrain/terrain'),
    PacketRouter = require('./packetRouter'),
    PacketWriter = require('./network/packetWriter'),
    PacketSender = require('./network/packetSender'),
    Encryption = require('./network/encryption'),
    EntityManager = require('./EntityManager');

function World() {
    EventEmitter.call(this);
    var self = this;
    this.worldTime = new Buffer(8);
    this.worldTime.fill(0);
    this.terrain = new Terrain();
    this.packetRouter = new PacketRouter(this);
    this.encryption = new Encryption();
    this.encryption.init(new Buffer('BurningPig', 'ascii'));

    this.settings = require('./settings.json');

    this.packetWriter = new PacketWriter();
    this.packetSender = new PacketSender(this);
    
    this.itemEntities = new EntityManager();
    this.npcEntities = new EntityManager();
    this.playerEntities = new EntityManager();

    this.nextEntityId = 1;   

    this.registerHandlers();
};

World.prototype = Object.create(EventEmitter.prototype, { constructor: { value: World }});

World.prototype.register = function(handlerName) {
    var handler = require('./handlers/' + handlerName);
    handler(this);
    return this;
};

World.prototype.startWorld = function () {
    var self = this;

    this.timeTimer = setInterval(function () {
        self.emit('game_tick');
    }, 50);

    this.keepAliveTimer = setInterval(function () {
        self.emit('keepalive_tick');
    }, 1000);
};

World.prototype.registerHandlers = function() {
    var self = this;

    this.register('timeHandler');
    this.register('serverPingHandler');
    this.register('keepAliveHandler');
    this.register('loginHandler');
    this.register('chatHandler');
    this.register('playerLookMovementHandler');
    this.register('diggingHandler');
    this.register('buildHandler');
    this.register('inventoryHandler');
    this.register('pluginHandler');

    self.on('use_entity', function(data, player) { self.packetRouter.useEntity(data, player) });
    self.on('entity_action', function(data, player) { self.packetRouter.entityAction(data, player) });
    self.on('close_window', function(data, player) { self.packetRouter.closeWindow(data, player) });
    self.on('click_window', function(data, player) { self.packetRouter.clickWindow(data, player) });
    self.on('confirm_transaction', function(data, player) { self.packetRouter.confirmTransaction(data, player) });
    self.on('creative_inventory_action', function(data, player) { self.packetRouter.creativeInventoryAction(data, player) });
    self.on('enchant_item', function(data, player) { self.packetRouter.enchantItem(data, player) });
    self.on('update_sign', function(data, player) { self.packetRouter.updateSign(data, player) });
    self.on('player_abilities', function(data, player) { self.packetRouter.playerAbilities(data, player) });
    self.on('locale_view_distance', function(data, player) { self.packetRouter.localeViewDistance(data, player) });
    self.on('disconnect', function(data, player) { self.disconnect(data, player) });
    self.on('end', function(player) { self.socketClosed(player) });
    self.on('destroy', function(player) { self.socketClosed(player) });
};

World.prototype.sendEntitiesToPlayer = function(targetPlayer) {
    targetPlayer.sendItemEntities(this.itemEntities, this.packetWriter);
    targetPlayer.sendNpcEntities(this.npcEntities, this.packetWriter);
    targetPlayer.sendPlayerEntities(this.playerEntities, this.packetWriter);
};

World.prototype.disconnect = function (data, player) {
    //Do stuff like save them to the database.

    this.playerEntities.remove(player.entityId);

    var message = { 
        translate: 'chat.type.announcement',
        using: ["Server", player.name + ' (' + player.id + ') has left the world!']
    }; 

    var leavingChat = this.packetWriter.build({ ptype: 0x03, message: JSON.stringify(message) });
    var clientlist = this.packetWriter.build({
        ptype: 0xC9, 
        playerName: player.name,
        online: false,
        ping: 0
    });

    var destroyEntity = this.packetWriter.build({
        ptype: 0x1D, 
        entityIds: [ player.entityId ]
    });

    this.packetSender.sendToAllPlayers(clientlist);
    this.packetSender.sendToAllPlayers(destroyEntity);
    this.packetSender.sendToAllPlayers(leavingChat);
};

World.prototype.socketClosed = function(player) {
    console.log('Player connection closed.');
};


module.exports = World;