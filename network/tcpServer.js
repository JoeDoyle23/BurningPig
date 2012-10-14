var net = require('net'),
    PacketStream = require('./packetStream'),
    BinaryWriter = require('../util/binaryWriter');

function TcpServer(world) {
	var server = net.createServer(function (stream) {
    
	    var client = { 
	        network: world.encryption.getEncryptor(),
	        decryptor: world.encryption.getDecryptor(),
	    };
	    
	    client.network.pipe(stream);

	    var packetStream = new PacketStream(client);

	    stream.on('connect', function () {
	        console.log('Got connection!'.green);
	        stream.isClosed = false;

	        var baseStreamWrite = stream.write;
	        stream.write = function () {
	            // I feel this is not the best way to do a safety check for an open socket before trying to write to it.
	            if (stream.isClosed)
	                return;

	            baseStreamWrite.apply(stream, arguments);
	        };
	    });

	    stream.on('error', function () {
	        stream.isClosed = true;
	    });

	    stream.on('end', function () {
	        stream.isClosed = true;
	    });

	    stream.on('destroy', function () {
	        stream.isClosed = true;
	    });

	    world.setupListeners(packetStream);

		stream.pipe(client.decryptor).pipe(packetStream);
	});
	
	return server;
}

module.exports = TcpServer;