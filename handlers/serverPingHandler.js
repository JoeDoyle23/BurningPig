var statusPackets = require('../network/packetList').serverStatusPackets
var loginPackets = require('../network/packetList').serverLoginPackets

var ServerPingHandler = function(world) {

    world.on("handshake", function (data, player) {
        console.log('Got handshake from client');

        if(!protocolCheck(data.protocolVersion, player, world)) {
          return;
        }

        console.log('Protocol Check passed');

        if (!serverFullCheck(player, world)) {
          return;
        }
    });

    world.on('status_request', function (data, player) {
        var serverStatus = {
            version: {
                name: "1.7.2",
                protocol: 4
            },
            players: {
                max: world.settings.maxPlayers,
                online: world.playerEntities.entities.length,
                sample: []
            },  
            description: {
                text: world.settings.serverName
            }
        };

        var statusResponse = world.packetWriter.buildStatus({
            ptype: statusPackets.Response, 
            response: JSON.stringify(serverStatus)
        });

        world.packetSender.sendPacket(player, statusResponse);
    });

    world.on('status_ping', function (data, player) {
        var statusPing = world.packetWriter.buildStatus({
            ptype: statusPackets.Ping, 
            time: data.time
        });

        world.packetSender.sendPacket(player, statusPing);
    });


};

function protocolCheck (protocol, player, world) {
    if (protocol !== 4) {
        console.log("The client sent a protocol id we don't support: %d".red, protocol);
        var kick = world.packetWriter.buildLogin({ ptype: loginPackets.Disconnect, reason: 'Sorry, your version of Minecraft needs to be 1.7.2 to use this server!' });
        world.packetSender.sendPacker(player, kick);
        world.packetSender.closeConnection(player);
        return false;
    }

    return true;
};


function serverFullCheck (player, world) {
    if (world.playerEntities.count() === world.settings.maxPlayers) {
        console.log("The server is full!".red);
        var kick = world.packetWriter.buildLogin({ ptype: loginPackets.Disconnect, reason: 'Sorry, the server is full.' });
        world.packetSender.sendPacket(player, kick);
        world.packetSender.closeConnection(player);
        return false;
    }

    return true;
};


module.exports = ServerPingHandler;
