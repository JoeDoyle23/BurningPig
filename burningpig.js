var net = require('net'),
    util = require('util'),
    fs = require('fs'),
    crypto = require('crypto'),
    zlib = require('zlib'),
    PacketParser = require('./packetParser'),
    BinaryWriter = require('./beConverters').BinaryWriter,
    PacketBuilder = require('./packetBuilder'),
    AnvilChunk = require('./anvilChunk');

console.log('Starting the BurningPig.');
    
var players = [];
var packetBuilder = new PacketBuilder();

var packetHandler = [];

var anvilChunks = [];
for (var x = 0; x < 10; x++) {
    for (var z = 0; z < 10; z++) {
        var chunk = new AnvilChunk(x, z);
        chunk.generateTestColumn();
        anvilChunks.push(chunk);
    }
}

var generateMap = function (callback) {
    var total_chunk = new Buffer(0);
    var columnmetadata = [];

    for (var i = 0; i < 100; i++) {
        var columndata = anvilChunks[i].getTransmissionBuffer();
        total_chunk = Buffer.concat([total_chunk, columndata], total_chunk.length + columndata.length);
        columnmetadata[i] = anvilChunks[i].metadata;
    }

    zlib.deflate(total_chunk, function (err, res) {
        var compressed_chunk = res;
        var data = {
            chunkCount: 100,
            chunkDataLength: compressed_chunk.length,
            chunkData: compressed_chunk,
            metadata: columnmetadata
        };

        callback(data);
    });
};

packetHandler[0x02] = function(data, stream) {
  console.log('Got handshake from user: ' + data.username);
  
  var data = {
    entityId: 1,
    gameMode: 0,
    dimension: 0,
    difficulty: 1,
    maxPlayers: 8
  };

  var packet = packetBuilder.build(0x01, data);

  var posData = {
    x: 72,
    y: 200,
    z: 72,
    stance: 201.62,
    yaw: 0,
    pitch: 0,
    onGround: true
  };
  
  var pos = packetBuilder.build(0x0D, posData);
  
  //stream.write(Buffer.concat([packet, map, pos], packet.length+map.length+pos.length));  
  stream.write(packet);

  var mapdata = generateMap(function (mapdata) {
      var map = packetBuilder.build(0x38, mapdata);
      stream.write(map);
      stream.write(pos);
  });
};

packetHandler[0x0D] = function(data, stream) {
  //console.log("Got client position info data: " + util.inspect(data, true, null, true));
};

packetHandler[0x0B] = function(data, stream) {
  //console.log("Got client position info data: " + util.inspect(data, true, null, true));
};

packetHandler[0xCC] = function(data, stream) {
  //console.log("Got client info data: " + util.inspect(data, true, null, true));
};

packetHandler[0xFE] = function(data, stream) {
  var serverStatus = 'Burning Pig Server!§0§8';
  
  var packet = packetBuilder.build(0xFF, {serverStatus: serverStatus});

  console.log("Sending packet: " + util.inspect(packet, true, null, true));
  stream.write(packet);
  stream.end();
};

var server = net.createServer(function (stream) {
    var parser = new PacketParser();
    var client = { network: stream};
    players.push(client);

	stream.on('connect', function () {
        console.log('Got connection!');
	});

	stream.pipe(parser);

	parser.on('end', function () {
    console.log('Connection closed!');
    client.closed = true;
		stream.end();
	});

	parser.on('error', function () {
    console.log('Connection closed due to error!');
    client.closed = true;
		stream.end();
	});

  client.timerId = setInterval(function() {
    if(client.closed) {
        clearInterval(client.timerId);
        return;
    }
    
    var ka = {
        keepAliveId: crypto.randomBytes(4).readInt32BE(0)
        };
    var packet = packetBuilder.build(0x00, ka);
    stream.write(packet);
  }, 1000);
  
	parser.on('data', function (data) {
	    //console.log('Got parsed data:'+ util.inspect(data));
	    if(packetHandler.hasOwnProperty(data.type)) {
          packetHandler[data.type](data, stream);
      } else {
        console.log("Got unhandled data: " + util.inspect(data, true, null, true));
      }      
	});	
});

var listenPort = 25565;
server.listen(listenPort);

console.log('Server listening on port ' + listenPort + '.');