var util = require('util')
  , crypto = require('crypto')
  , colors = require('colors')
  , PacketWriter = require('./packetWriter')
  , Player = require('./player');
  
function PacketHandler(world) {

    var packetHandler = [];
    var packetWriter = new PacketWriter();

    packetHandler[0x00] = function (data, client) {
        if (client.closed)
            return;

        client.player.rawping = process.hrtime(client.player.pingTimer);

        if (data.keepAliveId === 0) {
            return;
        }

        if (world.lastKeepAlive != data.keepAliveId) {
            console.log('Id: %d - Client sent bad KeepAlive: should have been: %d - was: %d'.red, client.id, client.lastKeepAlive, data.keepAliveId);
            var kick = packetWriter.build(0xFF, { serverStatus: 'Bad response to Keep Alive!' });
            client.network.write(kick);
            client.network.end();
        }
    };

    packetHandler[0x02] = function (data, client) {
        //console.log('Got handshake from user: ' + data.username);

        if(!world.protocolCheck(data.protocol, client)) {
          return;
        }
        
        client.id = crypto.randomBytes(4).readUInt32BE(0);
        client.player = new Player(client);
        client.player.name = data.username + crypto.randomBytes(1).readUInt8(0);
        client.player.entityId = world.nextEntityId++;
        
        console.log('New Player Id: %d EntityId: %d'.yellow, client.id, client.player.entityId);
        console.log('World Status: Players: %d'.yellow, world.players.length);

        var packet = packetWriter.build(0x01, {
            entityId: client.player.entityId,
            gameMode: world.settings.gameMode,
            dimension: world.settings.dimension,
            difficulty: world.settings.difficulty,
            maxPlayers: world.settings.maxPlayers
        });
        client.network.write(packet);

        var playerPosLook = client.player.getPositionLook();
        var playerAbsolutePosition = client.player.getAbsolutePosition();
        
        var namedEntity = packetWriter.build(0x14, {
            entityId: client.player.entityId,
            playerName: client.player.name,
            x: playerAbsolutePosition.x,
            y: playerAbsolutePosition.y,
            z: playerAbsolutePosition.z,
            yaw: playerAbsolutePosition.yaw,
            pitch: playerAbsolutePosition.pitch,
            currentItem: 0
        });

        world.players.push(client);
        world.entities[client.player.entityId] = client.player;

        world.sendToOtherPlayers(namedEntity, client);
        world.sendEntitiesToPlayer(client);

        console.log('%s (%d) has joined the world!', data.username, client.id);
        var welcomeChat = packetWriter.build(0x03, { message: data.username + ' (' + client.id + ') has joined the world!' });
        world.sendToAllPlayers(welcomeChat);

        var pos = packetWriter.build(0x0D, playerPosLook);

        var mapdata = world.terrain.compressedChunkData;
        var map = packetWriter.build(0x38, mapdata);
        client.network.write(map);
        client.network.write(pos);
    };

    packetHandler[0x03] = function (data, client) {
        if (data.message.length > 100)
            data.message = data.message.slice(0, 100);
        var chat = packetWriter.build(0x03, { message: client.player.name + ': ' + data.message });
        world.sendToAllPlayers(chat);
    };

    packetHandler[0x0B] = function (data, client) {
        var goodUpdate = client.player.updatePosition(data);
        //if (goodUpdate) {
        //    var update = packetWriter.build(0x1F, {
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
        //    var update = packetWriter.build(0x20, {
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
            console.log('Player started digging'.magenta);
        }
        if (data.status === 2) {
            console.log('Player stopped digging'.magenta);
        }
    };

    packetHandler[0xCC] = function (data, client) {
        //console.log('ID: %d Got client info data: ' + util.inspect(data, true, null, true), client.id);
    };

    packetHandler[0xFE] = function (data, client) {
        var serverStatus = world.settings.serverName + '§' + world.players.length + '§' + world.settings.maxPlayers;
        var packet = packetWriter.build(0xFF, { serverStatus: serverStatus });

        client.network.write(packet);
        client.network.end();
    };

    this.process = function (data, client) {
        if (packetHandler.hasOwnProperty(data.type)) {
            packetHandler[data.type](data, client);
        } else {
            console.log("Got unhandled data: ".red + util.inspect(data, true, null, true));
        }
    }
};

module.exports = PacketHandler;