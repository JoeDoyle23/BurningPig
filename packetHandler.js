var PacketBuilder = require('./packetBuilder');
var util = require('util');
var crypto = require('crypto');

function PacketHandler(world) {

    console.log('the world: ' + world);
    var packetHandler = [];
    var packetBuilder = new PacketBuilder();

    packetHandler[0x00] = function (data, client) {
        if (client.closed)
            return;

        if (client.lastKeepAlive != data.keepAliveId) {
            console.log('Id: %d - Client sent bad KeepAlive: should have been: %d - was: %d', client.id, client.lastKeepAlive, data.keepAliveId);
            var kick = packetBuilder.build(0xFF, { serverStatus: 'Bad response to Keep Alive!' });
            client.network.write(kick);
            client.network.end();
        }
    };

    packetHandler[0x02] = function (data, client) {
        //console.log('Got handshake from user: ' + data.username);

        client.playername = data.username;
        client.id = crypto.randomBytes(4).readInt32BE(0);
        console.log('New Player: %d', client.id);

        var data = {
            entityId: 1,
            gameMode: 0,
            dimension: 0,
            difficulty: 1,
            maxPlayers: 8
        };

        var packet = packetBuilder.build(0x01, data);

        var posData = {
            x: 5,
            y: 70,
            z: 5,
            stance: 71.62,
            yaw: 0,
            pitch: 0,
            onGround: true
        };

        var pos = packetBuilder.build(0x0D, posData);
        client.network.write(packet);

        var mapdata = world.terrain.generateMap(function (mapdata) {
            var map = packetBuilder.build(0x38, mapdata);
            client.network.write(map);
            client.network.write(pos);

            world.startKeepAlives(client);
        });
    };

    packetHandler[0x0B] = function (data, client) {
        //console.log("Got client position info data: " + util.inspect(data, true, null, true));
    };

    packetHandler[0x0D] = function (data, client) {
        //console.log("Got client position info data: " + util.inspect(data, true, null, true));
    };

    packetHandler[0x0E] = function (data, client) {

        if (data.status === 0) {
            console.log('Player started digging');
        }
        if (data.status === 2) {
            console.log('Player stopped digging');
        }
    };


    packetHandler[0xCC] = function (data, client) {
        //console.log("Got client info data: " + util.inspect(data, true, null, true));
    };

    packetHandler[0xFE] = function (data, client) {
        var serverStatus = 'Burning Pig Server!§0§8';

        var packet = packetBuilder.build(0xFF, { serverStatus: serverStatus });

        //console.log("Sending packet: " + util.inspect(packet, true, null, true));
        client.network.write(packet);
        client.network.end();
    };

    this.process = function (data, client) {
        if (packetHandler.hasOwnProperty(data.type)) {
            packetHandler[data.type](data, client);
        } else {
            console.log("Got unhandled data: " + util.inspect(data, true, null, true));
        }
    }
};


module.exports = PacketHandler;