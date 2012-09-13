var net = require('net'),
    util = require('util'),
    fs = require('fs'),
    zlib = require('zlib'),
    PacketParser = require('./packetParser'),
    BinaryWriter = require('./beConverters').BinaryWriter,
    World = require('./world');

console.log('Starting the BurningPig.');
    
var world = new World();

var server = net.createServer(function (stream) {
    var client = { network: stream };
    var parser = new PacketParser(client);
    world.players.push(client);

	stream.on('connect', function () {
        console.log('Got connection!');
	});

	stream.pipe(parser).pipe(world, { end: false });

	//parser.on('end', function () {
    //    console.log('Connection closed!');
    //    client.closed = true;
	//	stream.end();
	//});

	//parser.on('error', function () {
    //    console.log('Connection closed due to error!');
    //    client.closed = true;
	//	stream.end();
	//});
  
	//parser.on('data', function (data) {
	    //console.log('Got parsed data:'+ util.inspect(data));
	//});	
});

var listenPort = 25565;
server.listen(listenPort);

console.log('Server listening on port ' + listenPort + '.');