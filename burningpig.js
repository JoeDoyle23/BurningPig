var net = require('net'),
    util = require('util'),
    fs = require('fs'),
    zlib = require('zlib'),
    colors = require('colors'),
    PacketParser = require('./packetParser'),
    BinaryWriter = require('./beConverters').BinaryWriter,
    World = require('./world');

console.log('Lighting up the BurningPig!'.bold);
    
var world = new World();
world.loadSettings();

var server = net.createServer(function (stream) {
    var client = { network: stream };
    var parser = new PacketParser(client);

	stream.on('connect', function () {
        console.log('Got connection!'.green);
	});

	stream.pipe(parser).pipe(world, { end: false });
});

server.listen(world.settings.listenPort);

console.log('Server listening on port %d.'.green, world.settings.listenPort);