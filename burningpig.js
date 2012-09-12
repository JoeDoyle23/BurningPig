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

var anvil = {
  chunks: []
};

for (var x = 0; x < 10; x++) {
    for (var z = 0; z < 10; z++) {
        var chunk = new AnvilChunk(x, z);
        chunk.generateTestColumn();
        anvil.chunks.push(chunk);
    }
}

var generateMap = function (callback) {

    var total_chunk = new Buffer(0);
    var columnmetadata = [];
    var columndata = [];
    var len = 0;
    
     for (var i = 0; i < 100; i++) {
        var data = anvil.chunks[i].getTransmissionBuffer();
        columndata.push(data);
        len+=data.length;
        columnmetadata.push(anvil.chunks[i].metadata);
    }
    
    total_chunk = Buffer.concat(columndata, len);
 
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

packetHandler[0x00] = function(data, client) {
  if(client.closed)
    return;
  
  if(client.lastKeepAlive != data.keepAliveId) {
    console.log('Client sent bad KeepAlive: should have been: %d - was: %d', client.lastKeepAlive, data.keepAliveId);
    var kick = packetBuilder.build(0xFF, { serverStatus: 'Bad response to Keep Alive!' });
    client.network.write(kick);
    client.network.end();
  }
}
packetHandler[0x02] = function(data, client) {
  //console.log('Got handshake from user: ' + data.username);
  
  var data = {
    entityId: 1,
    gameMode: 0,
    dimension: 0,
    difficulty: 1,
    maxPlayers: 8
  };

  var packet = packetBuilder.build(0x01, data);

  var posData = {
    x: 5,
    y: 70,
    z: 5,
    stance: 71.62,
    yaw: 0,
    pitch: 0,
    onGround: true
  };
  
  var pos = packetBuilder.build(0x0D, posData);
  client.network.write(packet);

  var mapdata = generateMap(function (mapdata) {
      var map = packetBuilder.build(0x38, mapdata);
      client.network.write(map);
      client.network.write(pos);
  });
};

packetHandler[0x0B] = function(data, client) {
  //console.log("Got client position info data: " + util.inspect(data, true, null, true));
};

packetHandler[0x0D] = function(data, client) {
  //console.log("Got client position info data: " + util.inspect(data, true, null, true));
};

packetHandler[0x0E] = function(data, client) {
  
  if(data.status===0) {
    console.log('Player started digging');
  }
  if(data.status===2) {
    console.log('Player stopped digging');
  }
};


packetHandler[0xCC] = function(data, client) {
  //console.log("Got client info data: " + util.inspect(data, true, null, true));
};

packetHandler[0xFE] = function(data, client) {
  var serverStatus = 'Burning Pig Server!§0§8';
  
  var packet = packetBuilder.build(0xFF, {serverStatus: serverStatus});

  //console.log("Sending packet: " + util.inspect(packet, true, null, true));
  client.network.write(packet);
  client.network.end();
};

var server = net.createServer(function (stream) {
    var parser = new PacketParser();
    var client = { network: stream };
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
    client.lastKeepAlive = ka.keepAliveId;
    var packet = packetBuilder.build(0x00, ka);
    if(!client.closed) {
      stream.write(packet);    
    }
  }, 1000);
  
	parser.on('data', function (data) {
	    //console.log('Got parsed data:'+ util.inspect(data));
	    if(packetHandler.hasOwnProperty(data.type)) {
          packetHandler[data.type](data, client);
      } else {
        console.log("Got unhandled data: " + util.inspect(data, true, null, true));
      }      
	});	
});

var listenPort = 25565;
server.listen(listenPort);

console.log('Server listening on port ' + listenPort + '.');