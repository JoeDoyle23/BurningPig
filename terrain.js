var zlib = require('zlib');
var AnvilChunk = require('./anvilChunk');

function Terrain() {
    var self = this;

    var anvil = {
        chunks: []
    };

    //Test data for now
    for (var x = 0; x < 10; x++) {
        for (var z = 0; z < 10; z++) {
            var chunk = new AnvilChunk(x, z);
            chunk.generateTestColumn();
            anvil.chunks.push(chunk);
        }
    }

    self.compressedChunkData = {};

    this.generateMap = function (callback) {

        if (self.compressedChunkData.chunkCount) {
            callback(self.compressedChunkData);
        }

        var total_chunk = new Buffer(0);
        var columnmetadata = [];
        var columndata = [];
        var len = 0;

        for (var i = 0; i < 100; i++) {
            var data = anvil.chunks[i].getTransmissionBuffer();
            columndata.push(data);
            len += data.length;
            columnmetadata.push(anvil.chunks[i].metadata);
        }

        total_chunk = Buffer.concat(columndata, len);

        zlib.deflate(total_chunk, function (err, compressed_chunk) {
            self.compressedChunkData = {
                chunkCount: 100,
                chunkDataLength: compressed_chunk.length,
                chunkData: compressed_chunk,
                metadata: columnmetadata
            };

            callback(self.compressedChunkData);
        });
    };
};

module.exports = Terrain;