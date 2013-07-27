var KeepAliveHandler = function(world) {

    world.on("keepalive", function(data, player) {

	    if (player.closed)
	        return;

	    player.rawping = process.hrtime(player.pingTimer);

	    if (data.keepAliveId === 0) {
	        return;
	    }

	    if (world.lastKeepAlive != data.keepAliveId) {
	        console.log('Id: %d - Player sent bad KeepAlive: should have been: %d - was: %d'.red, player.id, player.lastKeepAlive, data.keepAliveId);
	        var kick = world.packetWriter.build({ ptype: 0xFF, serverStatus: 'Bad response to Keep Alive!' });
	        world.packetSender.sendPacket(player, kick);
	        world.packetSender.closeConnection(player);
	    }
    });
};

module.exports = KeepAliveHandler;