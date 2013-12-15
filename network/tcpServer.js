var net = require('net'),
    PacketStream = require('./packetStream'),
    Player = require('../player');

function TcpServer(world) {
	var server = net.createServer(function (stream) {
    
	    var player = new Player();
	    player.network = world.encryption.getEncryptor();
	    player.decryptor = world.encryption.getDecryptor();
	    
	    player.packetStream = new PacketStream(world, player);

	    stream.on('connect', function () {
	        console.log('Got connection!'.green);
	        stream.isClosed = false;
	    });

		stream.on('error', function(err) {
			console.log('Crash!');
			console.log(err);
		});
		
        stream.on('destroy', function () {
	        stream.isClosed = true;
	    });

		player.network.pipe(stream).pipe(player.decryptor).pipe(player.packetStream);
	});
	
	return server;
}

module.exports = TcpServer;