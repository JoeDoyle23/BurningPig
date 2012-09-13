var util = require('util');
var crypto = require('crypto');
var PacketBuilder = require('./packetBuilder');
var Player = require('./player');

function PacketHandler(world) {

    var packetHandler = [];
    var packetBuilder = new PacketBuilder();

    packetHandler[0x00] = function (data, client) {
        if (client.closed)
            return;

        if (world.lastKeepAlive != data.keepAliveId) {
            console.log('Id: %d - Client sent bad KeepAlive: should have been: %d - was: %d', client.id, client.lastKeepAlive, data.keepAliveId);
            var kick = packetBuilder.build(0xFF, { serverStatus: 'Bad response to Keep Alive!' });
            client.network.write(kick);
            client.network.end();
        }
    };

    packetHandler[0x02] = function (data, client) {
        //console.log('Got handshake from user: ' + data.username);

        if (data.protocol !== 39) {
            console.log("The client sent a protocol id we don't support: %d", data.protocol);
            var kick = packetBuilder.build(0xFF, { serverStatus: 'Sorry, your version of Minecraft needs to be 1.3.2 to use this server!' });
            client.network.write(kick);
            client.network.end();
            return;
        }

        client.id = crypto.randomBytes(4).readUInt32BE(0);
        client.player = new Player(client);
        client.player.name = data.username;

        console.log('New Player: %d', client.id);
        console.log('World Status: Players: %d', world.players.length);

        world.players.push(client);

        var login = {
            entityId: 1,
            gameMode: 0,
            dimension: 0,
            difficulty: 1,
            maxPlayers: 8
        };

        var packet = packetBuilder.build(0x01, login);

        var posData = {
            x: 0,
            y: 64.5,
            z: 0,
            stance: 66.12,
            yaw: 0,
            pitch: 0,
            onGround: true
        };

        var pos = packetBuilder.build(0x0D, posData);
        client.network.write(packet);

        var welcomeChat = packetBuilder.build(0x03, { message: data.username + ' (' + client.id + ') has joined the world!' });
        world.sendToAllPlayers(welcomeChat);

        var mapdata = world.terrain.generateMap(function (mapdata) {
            var map = packetBuilder.build(0x38, mapdata);
            client.network.write(map);
            client.network.write(pos);
        });
    };

    packetHandler[0x03] = function (data, client) {
        if (data.message.length > 100)
            data.message = data.message.slice(0, 100);
        var chat = packetBuilder.build(0x03, { message: client.player.name + ': ' + data.message });
        world.sendToAllPlayers(chat);
    };

    packetHandler[0x0B] = function (data, client) {
        client.player.updatePosition(data);
    };

    packetHandler[0x0D] = function (data, client) {
        client.player.updatePosition(data);
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
        var serverStatus = world.settings.serverName + '§' + world.players.length + '§' + world.settings.maxPlayers;
        var packet = packetBuilder.build(0xFF, { serverStatus: serverStatus });

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