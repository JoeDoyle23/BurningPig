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

        client.player.rawping = process.hrtime(client.player.pingTimer);

        if (data.keepAliveId === 0) {
            return;
        }

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
        client.player.name = data.username + crypto.randomBytes(1).readUInt8(0);
        client.player.entityId = world.nextEntityId++;
        
        console.log('New Player: %d EntityId: ', client.id, client.player.entityId);
        console.log('World Status: Players: %d', world.players.length);

        var login = {
            entityId: client.player.entityId,
            gameMode: 0,
            dimension: 0,
            difficulty: 1,
            maxPlayers: world.settings.maxPlayers
        };

        var packet = packetBuilder.build(0x01, login);
        client.network.write(packet);

        var playerPosLook = client.player.getPositionLook();


        var namedEntity = packetBuilder.build(0x14, {
            entityId: client.player.entityId,
            playerName: client.player.name,
            x: 0,
            y: 2080,
            z: 0,
            yaw: 0,
            pitch: 0,
            currentItem: 0
        });
        world.sendToOtherPlayers(namedEntity, client);
        //console.log(util.inspect(namedEntity, true, null, true));

        world.players.push(client);
        world.entities[client.player.entitiyId] = client.player;

        var welcomeChat = packetBuilder.build(0x03, { message: data.username + ' (' + client.id + ') has joined the world!' });
        world.sendToAllPlayers(welcomeChat);

        var pos = packetBuilder.build(0x0D, playerPosLook);

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
        var goodUpdate = client.player.updatePosition(data);
        //if (goodUpdate) {
        //    var update = packetBuilder.build(0x1F, {
        //        entityId: client.player.entityId,
        //        yaw: client.player.yaw,
        //        pitch: client.player.pitch
        //    });
        //    world.sendToOtherPlayers(update, client);
        //}
    };

    packetHandler[0x0C] = function (data, client) {
        var goodUpdate = client.player.updatePosition(data);
        //if (goodUpdate) {
        //    var update = packetBuilder.build(0x20, {
        //        entityId: client.player.entityId,
        //        yaw: client.player.yaw,
        //        pitch: client.player.pitch
        //    });
        //    world.sendToOtherPlayers(update, client);
        //}
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
        console.log('ID: ' + client.id + ' Got client info data: ' + util.inspect(data, true, null, true));
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