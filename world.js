var util = require('util');
var Stream = require('stream').Stream;
var crypto = require('crypto');
var Terrain = require('./terrain/terrain');
var PacketHandler = require('./packetHandler');
var PacketWriter = require('./network/packetWriter');
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
    this.packetWriter = new PacketWriter();
    this.entities = {};
    this.nextEntityId = 1;

    this.settings = require('./settings.json');

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

        var keepAlivePacket = self.packetWriter.build(0x00, ka);
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

        var time = self.packetWriter.build(0x04, { time: self.worldTime });

        var packetLength = 0;
        
        self.players.forEach(function (client, idx) {
            var cPing = client.player.getPing();

            var clientlist = self.packetWriter.build(0xC9, {
                playerName: client.player.name,
                online: true,
                ping:  cPing > 0xFFFF ? 0xFFFF : cPing
            });
            self.sendToAllPlayers(clientlist);
        });

        self.sendToAllPlayers(time);
    }, 50);
};

World.prototype.write = function (data, encoding) {
    if (data.data === 'end') {
        this.removePlayerFromList(data.client.id);
        console.log('Connection closed!'.red);
        return;
    }

    if (data.data === 'exception') {
        this.removePlayerFromList(data.client.id);
        console.log('Socket Exception: '.red + data.exception);
        data.client.network.end();
        return;
    }

    if (data.data === 'destroyed') {
        this.removePlayerFromList(data.client.id);
        console.log('Connection destroyed!'.red);
        data.client.network.end();
        return;
    }

    this.packetHandler.process(data);
};

World.prototype.end = function (client) {
    this.emit('end');
};

World.prototype.error = function () {
    this.emit('error');
};

World.prototype.destroy = function (client) {
    this.emit('destroy');
};

World.prototype.loadSettings = function () {

};

World.prototype.sendToAllPlayers = function (packet) {
    this.players.forEach(function (client, idx) {
        client.network.write(packet);
    });
};

World.prototype.sendToOtherPlayers = function (packet, sourcePlayer) {
    this.players.forEach(function (client, idx) {
        if (sourcePlayer.id !== client.id) {
            client.network.write(packet);
        }
    });
};
World.prototype.sendEntitiesToPlayer = function(targetPlayer) {
    var self = this;
    for (var entityId in this.entities) {
        if (this.entities.hasOwnProperty(entityId)) {
            var entity = this.entities[entityId];
            if (targetPlayer.player.entityId !== entity.entityId) {
                var absolutePosition = entity.getAbsolutePosition();
                var namedEntity = self.packetWriter.build(0x14, {
                    entityId: entity.entityId,
                    playerName: entity.name,
                    x: absolutePosition.x,
                    y: absolutePosition.y,
                    z: absolutePosition.z,
                    yaw: absolutePosition.yaw,
                    pitch: absolutePosition.pitch,
                    currentItem: 0
                });
                targetPlayer.network.write(namedEntity);
            }
        }
    }
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
        var clientEntityId = client.player.entityId;
        console.log('Entity: %d', clientEntityId);
        this.players.splice(client.index, 1);
        this.removeEntities([clientEntityId]);
        if (this.players.length > 0) {
          var leavingChat = this.packetWriter.build(0x03, { message: client.player.name + ' (' + client.id + ') has left the world!' });
          var clientlist = this.packetWriter.build(0xC9, {
              playerName: client.player.name,
              online: false,
              ping: 0
          });

          this.sendToAllPlayers(Buffer.concat([clientlist, leavingChat], clientlist.length + leavingChat.length));
        }
        return;
    }
};

World.prototype.protocolCheck = function(protocol, client) {
    if (protocol !== 39) {
        console.log("The client sent a protocol id we don't support: %d".red, protocol);
        var kick = this.packetWriter.build(0xFF, { serverStatus: 'Sorry, your version of Minecraft needs to be 1.3.2 to use this server!' });
        client.network.write(kick);
        client.network.end();
        return false;
    }

    return true;
};

World.prototype.serverFullCheck = function (client) {
    if (this.players.length === this.settings.maxPlayers) {
        console.log("The server is full!".red);
        var kick = this.packetWriter.build(0xFF, { serverStatus: 'Sorry, the server is full.' });
        client.network.write(kick);
        client.network.end();
        return false;
    }

    return true;
};

World.prototype.removeEntities = function(entityIdArray) {
    var self = this;

    entityIdArray.forEach(function (entityId, idx) {
        if (self.entities.hasOwnProperty(entityId)) {
            delete self.entities[entityId];
        }
    });

    var packet = this.packetWriter.build(0x1D, {
        entityIds: entityIdArray
    });

    console.log(self.entities.length);


    this.sendToAllPlayers(packet);
};

module.exports = World;