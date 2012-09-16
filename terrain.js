var zlib = require('zlib');
var TerrainColumn = require('./terrainColumn');

function Terrain() {
    var self = this;

    this.columns = [];

    //Test data for now
    for (var x = -5; x < 5; x++) {
        for (var z = -5; z < 5; z++) {
            var chunk = new TerrainColumn(x, z);
            chunk.generateTestColumn();
            this.columns.push({ x: x, z: z, chunk: chunk });
        }
    }

    self.compressedChunkData = {};
    self.generateMap();    
};

Terrain.prototype.generateMap = function () {
    var self = this;

    var columnmetadata = [];
    var columndata = [];
    var len = 0;

    for (var i = 0; i < 100; i++) {
        var data = this.columns[i].chunk.getTransmissionBuffer();
        columndata.push(data);
        len += data.length;
        columnmetadata.push(this.columns[i].chunk.metadata);
    }

    var total_chunk = Buffer.concat(columndata, len);

    zlib.deflate(total_chunk, function (err, compressed_chunk) {
        self.compressedChunkData = {
            chunkCount: 100,
            chunkDataLength: compressed_chunk.length,
            chunkData: compressed_chunk,
            metadata: columnmetadata
        };
    });
};

Terrain.prototype.buildColumnPacket = function (columnsRequested) {
    var self = this;

    var columnmetadata = [];
    var columndata = [];
    var len = 0;

    columnsRequested.forEach(function (columnRequest, idx) {
        for (var i = 0; i < self.columns.length; i++) {
            if (self.columns[i].x === columnRequest.x && self.columns[i].z === columnRequest.z) {
                var data = self.columns[i].chunk.getTransmissionBuffer();
                columndata.push(data);
                len += data.length;
                columnmetadata.push(this.columns[i].chunk.metadata);
                break;
            }
        }
    });

    var total_chunk = Buffer.concat(columndata, len);

    zlib.deflate(total_chunk, function (err, compressed_chunk) {
        self.compressedChunkData = {
            chunkCount: columnsdata.length,
            chunkDataLength: compressed_chunk.length,
            chunkData: compressed_chunk,
            metadata: columnmetadata
        };
    });
}

Terrain.prototype.getBlock = function(position) {
    var chunkX = position.x / (16) - (position.x < 0 ? 1 : 0);
    var chunkZ = position.z / (16) - (position.z < 0 ? 1 : 0);

    for (var i = 0; i < self.columns.length; i++) {
        if (this.columns[i].x === columnRequest.x && this.columns[i].z === columnRequest.z) {
            return this.columns[i].getBlock(position);
        }
    }
};

Terrain.prototype.setBlock = function (position, blockData) {
    var chunkX = position.x / (16) - (position.x < 0 ? 1 : 0);
    var chunkZ = position.z / (16) - (position.z < 0 ? 1 : 0);

    for (var i = 0; i < self.columns.length; i++) {
        if (this.columns[i].x === columnRequest.x && this.columns[i].z === columnRequest.z) {
            return this.columns[i].setBlock(position, blockData);
        }
    }
};

module.exports = Terrain;