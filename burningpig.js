var net = require('net'),
    util = require('util'),
    fs = require('fs'),
    crypto = require('crypto'),
    zlib = require('zlib'),
    PacketParser = require('./packetParser'),
    BinaryWriter = require('./binaryReader').BinaryWriter,
    PacketBuilder = require('./packetBuilder');

console.log('Starting the Burning Pig.');
    
var players = [];
var packetBuilder = new PacketBuilder();

var packetHandler = [];

var chunk = new Buffer(4096);
var meta = new Buffer(2048);
var light = new Buffer(4096);

chunk.fill(3);
meta.fill(0);
light.fill(0xff);

var uncompress_chunk = Buffer.concat([chunk, meta, light], 10240);
var total_chunk = new Buffer(0);
var compressed_chunk = new Buffer(0);

var biome = new Buffer(256);
biome.fill(1);

for(var i=0;i<81;i++) {
   total_chunk = Buffer.concat([total_chunk, uncompress_chunk, biome], total_chunk.length + 10240 + 256); 
}

zlib.deflate(total_chunk, function (err, res) {
    compressed_chunk = res;
});

var generateMap = function() {
  var data = {
      chunkCount: 81,
      chunkDataLength: compressed_chunk.length,
      chunkData: compressed_chunk,
      metadata: []
  };
    for(var x=0;x<9;x++) {
        for(var z=0;z<9;z++) {

        data.metadata.push({
                      chunkX: x,
                      chunkZ: z,
                      primaryBitmap: 8,
                      addBitmap: 0
                      });
        }
    }    

  return data;
}

packetHandler[0x02] = function(data, stream) {
  console.log('Got handshake from user: ' + data.username);
  
  var data = {
    entityId: 1,
    gameMode: 0,
    dimension: 0,
    difficulty: 1,
    maxPlayers: 8
  };

  var mapdata = generateMap();
  var packet = packetBuilder.build(0x01, data);
  var map = packetBuilder.build(0x38, mapdata);

  var posData = {
    x: 72,
    y: 66,
    z: 72,
    stance: 67.62,
    yaw: 0,
    pitch: 0,
    onGround: true
  };
  
  var pos = packetBuilder.build(0x0D, posData);
  
  //stream.write(Buffer.concat([packet, map, pos], packet.length+map.length+pos.length));  
  stream.write(packet);  
  stream.write(map);  
  stream.write(pos);  
};

packetHandler[0x0D] = function(data, stream) {
  console.log("Got client position info data: " + util.inspect(data, true, null, true));
};

packetHandler[0x0B] = function(data, stream) {
  console.log("Got client position info data: " + util.inspect(data, true, null, true));
};

packetHandler[0xCC] = function(data, stream) {
  console.log("Got client info data: " + util.inspect(data, true, null, true));
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