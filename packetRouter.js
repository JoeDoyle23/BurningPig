var util = require('util'),
    crypto = require('crypto'),
    EventEmitter = require('events').EventEmitter,
    PacketWriter = require('./network/packetWriter'),
    PacketSender = require('./network/packetSender')
    Player = require('./player'),
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
};
util.inherits(PacketRouter, EventEmitter);


module.exports = PacketRouter;