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
    this.worldTime = new Buffer(8);
    this.worldTime.fill(0);
    this.players = [];
    this.terrain = new Terrain();
    this.packetHandler = new PacketHandler(self);
    this.packetBuilder = new PacketBuilder();
    this.entities = [];
    this.nextEntityId = 1;

    this.settings = {
        serverName: 'BurningPig Dev Server!',
        listenPort: 25565,
        maxPlayers: 8
    };

    this.startKeepAlives();
    this.startTimeAndClients();
};

util.inherits(World, Stream);

World.prototype.startKeepAlives = function () {
    var self = this;

    this.keepAliveTimer = setInterval(function () {
        if (self.players.length === 0) {
            return;
        }

        self.lastKeepAlive = crypto.randomBytes(4).readInt32BE(0);
        var ka = { keepAliveId: self.lastKeepAlive };

        self.players.forEach(function (client, idx) {
            client.player.pingTimer = process.hrtime();
        });

        var keepAlivePacket = self.packetBuilder.build(0x00, ka);
        self.sendToAllPlayers(keepAlivePacket);

    }, 1000);
};

World.prototype.startTimeAndClients = function () {
    var self = this;

    this.timeTimer = setInterval(function () {
        var timeHigh = self.worldTime.readUInt32BE(0, 4);
        var timeLow = self.worldTime.readUInt32BE(4, 4) + 1;
        if (timeLow & 0xFFFF === 0) {
            timeHigh++;
        }
        self.worldTime.writeUInt32BE(timeHigh, 0, 4);
        self.worldTime.writeUInt32BE(timeLow, 4, 4);

        var time = self.packetBuilder.build(0x04, { time: self.worldTime });

        var packetLength = 0;
        
        self.players.forEach(function (client, idx) {
            var clientlist = self.packetBuilder.build(0xC9, {
                playerName: client.player.name,
                online: true,
                ping: client.player.getPing()
            });
            self.sendToAllPlayers(clientlist);
        });

        self.sendToAllPlayers(time);
    }, 50);

};

World.prototype.write = function (data, encoding) {
    if (data.data === 'end') {
        data.client.closed = true;
        this.removePlayerFromList(data.client.id);
        console.log('Connection closed!');
        data.client.network.end();
        return;
    }

    if (data.data === 'exception') {
        data.client.closed = true;
        this.removePlayerFromList(data.client.id);
        console.log('Socket Exception: ' + data.exception);
        data.client.network.end();
        return;
    }

    if (data.data === 'destroyed') {
        data.client.closed = true;
        this.removePlayerFromList(data.client.id);
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
        console.log('op: %d - %d', sourcePlayer.id,client.id);
        if (!client.closed && (sourcePlayer.id !== client.id)) {
            console.log('op: sending packet');
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
        var clientlist = this.packetBuilder.build(0xC9, {
            playerName: client.player.name,
            online: false,
            ping: 0
        });

        this.sendToAllPlayers(Buffer.concat([clientlist, leavingChat], clientlist.length+leavingChat.length));
        return;
    }
};

module.exports = World;