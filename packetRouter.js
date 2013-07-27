var util = require('util'),
    crypto = require('crypto'),
    EventEmitter = require('events').EventEmitter,
    PacketWriter = require('./network/packetWriter'),
    PacketSender = require('./network/packetSender')
    Player = require('./player'),
    blockDrops = require('./blockMapping'),
    CommandHandler = require('./CommandHandler');
  
function PacketRouter(world) {
    EventEmitter.call(this);
    this.world = world;

    var self = this;
    var packetWriter = new PacketWriter();
    var packetSender = new PacketSender(world);

    this.useEntity = function (data, player) {
        console.log('Got useEntity, need to add code!'.red);
    };

    this.playerBlockPlacement = function (data, player) {
        console.log('Got playerBlockPlacement, need to add code!'.red);
    };

    this.heldItemChange = function (data, player) {
        player.activeSlot = data.slotId;

        var entityHolding = packetWriter.build({
            ptype: 0x05,
            entityId: player.entityId,
            slot: player.activeSlot,
            item: { itemId: -1 }
        });

        packetSender.sendToOtherPlayers(entityHolding, player);
    };

    this.animation = function (data, player) {
        var packet = packetWriter.build({
            ptype: 0x12, 
            entityId: data.entityId,
            animation: data.animation
        });
        packetSender.sendToOtherPlayers(packet, player);
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

    this.localeViewDistance = function (data, player) {
        console.log('Got localeViewDistance, need to add code!'.red);
    };

    this.pluginMessage = function (data, player) {
        console.log('Got pluginMessage, need to add code!'.red);
    };
};
util.inherits(PacketRouter, EventEmitter);


module.exports = PacketRouter;