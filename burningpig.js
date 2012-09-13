var net = require('net'),
    util = require('util'),
    fs = require('fs'),
    zlib = require('zlib'),
    PacketParser = require('./packetParser'),
    BinaryWriter = require('./beConverters').BinaryWriter,
    World = require('./world');

console.log('Lighting up the BurningPig!');
    
var world = new World();
world.loadSettings();

var server = net.createServer(function (stream) {
    var client = { network: stream };
    var parser = new PacketParser(client);

	stream.on('connect', function () {
        console.log('Got connection!');
	});

	stream.pipe(parser).pipe(world, { end: false });
});

server.listen(world.settings.listenPort);

console.log('Server listening on port ' + world.settings.listenPort + '.');