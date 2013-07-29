var net = require('net'),
    PacketStream = require('./packetStream'),
    Player = require('../player');

function TcpServer(world) {
	var server = net.createServer(function (stream) {
    
	    var player = new Player();
	    player.network = world.encryption.getEncryptor();
	    player.decryptor = world.encryption.getDecryptor();
	    
	    var packetStream = new PacketStream(world, player);

	    stream.on('connect', function () {
	        console.log('Got connection!'.green);
	        stream.isClosed = false;

	        //var baseStreamWrite = stream.write;
	        //stream.write = function () {
	            // I feel this is not the best way to do a safety check for an open socket before trying to write to it.
	        //    if (stream.isClosed)
	        //        return;

	        //    baseStreamWrite.apply(stream, arguments);
	        //};
	    });

		stream.on('error', function() {
			console.log('Crash!');
		});
		
        stream.on('destroy', function () {
	        stream.isClosed = true;
	    });

		player.network.pipe(stream).pipe(player.decryptor).pipe(packetStream);
	});
	
	return server;
}

module.exports = TcpServer;