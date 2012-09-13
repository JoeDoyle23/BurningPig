var util = require('util');
var Stream = require('stream').Stream;
var crypto = require('crypto');
var Terrain = require('./terrain');
var PacketHandler = require('./packetHandler');
var PacketBuilder = require('./packetBuilder');
var Player = require('./player');

function World() {
    var self = this;
    Stream.call(this);
    this.writable = true;
    this.readable = true;

    this.players = [];
    this.terrain = new Terrain();
    this.packetHandler = new PacketHandler(self);
    this.packetBuilder = new PacketBuilder();

    this.settings = {
        serverName: 'BurningPig Dev Server!',
        listenPort: 25565,
        maxPlayers: 8
    };

    this.startKeepAlives();

};

util.inherits(World, Stream);

World.prototype.startKeepAlives = function () {
    var self = this;

    this.keepAliveTimer = setInterval(function () {
        if (self.players.length === 0) {
            return;
        }

        self.lastKeepAlive = crypto.randomBytes(4).readInt32BE(0);
        var ka = {
            keepAliveId: self.lastKeepAlive
        };

        var keepAlivePacket = self.packetBuilder.build(0x00, ka);
        self.sendToAllPlayers(keepAlivePacket);

    }, 1000);
};

World.prototype.write = function (data, encoding) {
    if (data.data === 'end') {
        this.removePlayerFromList(data.client.id);
        data.client.closed = true;
        console.log('Connection closed!');
        data.client.network.end();
        return;
    }

    if (data.data === 'exception') {
        this.removePlayerFromList(data.client.id);
        data.client.closed = true;
        console.log('Socket Exception: ' + data.exception);
        data.client.network.end();
        return;
    }

    if (data.data === 'destroyed') {
        this.removePlayerFromList(data.client.id);
        data.client.closed = true;
        console.log('Connection destroyed!');
        data.client.network.end();
        return;
    }

    this.packetHandler.process(data.data, data.client);
};

World.prototype.end = function (client) {
    this.emit('end');
};

World.prototype.error = function () {
    this.emit('error');
};

World.prototype.destroy = function (client) {
    this.emit('destroy');
    console.log(client);

};

World.prototype.loadSettings = function () {

};

World.prototype.sendToAllPlayers = function (packet) {
    this.players.forEach(function (client, idx) {
        if (!client.closed) {
            client.network.write(packet);
        }
    });
};

World.prototype.sendToOtherPlayers = function (packet, sourcePlayer) {
    this.players.forEach(function (client, idx) {
        if (!client.closed && sourcePlayer.id!==client.id) {
            client.network.write(packet);
        }
    });
};

World.prototype.findPlayer = function(id) {
    for(var i=0;i<this.players.length;i++) {
        if (this.players[i].id === id) {
            var player = this.players[i];
            player.index = i;
            return player;
        }
    }
};

World.prototype.removePlayerFromList = function (id) {
    var client = this.findPlayer(id);
    if (client) {
        this.players.splice(client.index, 1);
        var leavingChat = this.packetBuilder.build(0x03, { message: client.player.name + ' (' + client.id + ') has left the world!' });
        this.sendToAllPlayers(leavingChat);
        return;
    }
};

module.exports = World;