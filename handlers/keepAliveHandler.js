var crypto = require('crypto');
var packets = require('../network/packetList').serverPackets

var KeepAliveHandler = function(world) {

	world.on('keepalive_tick', function() {
        if (world.playerEntities.count() === 0) {
            return;
        }

        world.lastKeepAlive = crypto.randomBytes(4).readInt32BE(0);
        var ka = { ptype: packets.KeepAlive, keepAliveId: world.lastKeepAlive };

        world.playerEntities.getAll().forEach(function (player, idx) {
            player.pingTimer = process.hrtime();
        });

        var keepAlivePacket = world.packetWriter.build(ka);
        world.packetSender.sendToAllPlayers(keepAlivePacket);
	});

    world.on("keepalive", function(data, player) {

	    if (player.closed)
	        return;

	    player.rawping = process.hrtime(player.pingTimer);

	    if (data.keepAliveId === 0) {
	        return;
	    }

	    if (world.lastKeepAlive != data.keepAliveId) {
	        console.log('Id: %d - Player sent bad KeepAlive: should have been: %d - was: %d'.red, player.id, player.lastKeepAlive, data.keepAliveId);
	        var kick = world.packetWriter.build({ ptype: packets.Disconnect, serverStatus: 'Bad response to Keep Alive!' });
	        world.packetSender.sendPacket(player, kick);
	        world.packetSender.closeConnection(player);
	    }
    });
};

module.exports = KeepAliveHandler;