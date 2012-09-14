var zlib = require('zlib');
var AnvilChunk = require('./anvilChunk');

function Terrain() {
    var self = this;

    this.anvil = {
        chunks: []
    };

    //Test data for now
    for (var x = -5; x < 5; x++) {
        for (var z = -5; z < 5; z++) {
            var chunk = new AnvilChunk(x, z);
            chunk.generateTestColumn();
            this.anvil.chunks.push(chunk);
        }
    }

    self.compressedChunkData = {};
    self.generateMap();    
};

Terrain.prototype.generateMap = function () {
    var self = this;
    var total_chunk = new Buffer(0);
    var columnmetadata = [];
    var columndata = [];
    var len = 0;

    for (var i = 0; i < 100; i++) {
        var data = this.anvil.chunks[i].getTransmissionBuffer();
        columndata.push(data);
        len += data.length;
        columnmetadata.push(this.anvil.chunks[i].metadata);
    }

    total_chunk = Buffer.concat(columndata, len);

    zlib.deflate(total_chunk, function (err, compressed_chunk) {
        self.compressedChunkData = {
            chunkCount: 100,
            chunkDataLength: compressed_chunk.length,
            chunkData: compressed_chunk,
            metadata: columnmetadata
        };
    });
};

module.exports = Terrain;