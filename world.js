var util = require('util');
var Stream = require('stream').Stream;
var Terrain = require('./terrain');
var PacketHandler = require('./packetHandler');
var PacketBuilder = require('./packetBuilder');
var crypto = require('crypto');


function World() {
    var self = this;
    Stream.call(this);
    this.writable = true;
    this.readable = true;

    this.players = [];
    this.terrain = new Terrain();
    this.packetHandler = new PacketHandler(self);

    var packetBuilder = new PacketBuilder();

    this.startKeepAlives = function(client) {
        client.timerId = setInterval(function() {
            if(client.closed) {
                clearInterval(client.timerId);
                return;
            }
    
            var ka = {
                keepAliveId: crypto.randomBytes(4).readInt32BE(0)
            };
            client.lastKeepAlive = ka.keepAliveId;
            var packet = packetBuilder.build(0x00, ka);
            if(!client.closed) {
                client.network.write(packet);    
            }
        }, 5000);
    }

};

util.inherits(World, Stream);

World.prototype.write = function (data, encoding) {
    if (data.data === 'end') {
        data.client.closed = true;
        console.log('Connection closed!');
        data.client.network.end();
        return;
    }

    if (data.data === 'exception') {
        data.client.closed = true;
        console.log('Socket Exception: ' + data.exception);
        data.client.network.end();
        return;
    }

    if (data.data === 'end') {
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


module.exports = World;