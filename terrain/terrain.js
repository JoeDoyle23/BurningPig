var util = require('util');
var zlib = require('zlib');
var TerrainPersister = require('./terrainPersister');


function Terrain() {
    var self = this;

    this.terrainPersister = new TerrainPersister();
    this.levelName = '';
    this.columns = {};

    this.openLevel('testWorld');

    var saveTerrainChanges = function () {
        if (Object.keys(self.columns).length === 0)
            return;

        for (var columnKey in self.columns) {
            if (!self.columns[columnKey].isSaved) {
                self.saveTerrainColumn(self.columns[columnKey]);
            }
        }
    };

    for (var x = -5; x < 5; x++) {
        for (var z = -5; z < 5; z++) {
            self.loadTerrain(x, z, function (column) {
                self.columns[util.format('%d~%d', column.x, column.z)] = column;
            });
        }
    }

    self.terrainTimer = setInterval(saveTerrainChanges, 2000);

    //Test data for now
    //for (var x = -5; x < 5; x++) {
    //    for (var z = -5; z < 5; z++) {
    //        var chunk = new TerrainColumn(x, z);
    //        chunk.generateTestColumn();
    //        this.columns.push({ x: x, z: z, chunk: chunk });
    //    }
    //}

    //self.generateMap();

    //console.log('Saving terrain');
    //self.saveTerrain();
    //console.log('Done!');
};

Terrain.prototype.getMapPacket = function (callback) {
    var self = this;

    var columnmetadata = [];
    var columndata = [];
    var len = 0;

    var chunkColumnCount = 0;

    for (var columnKey in self.columns) {
        var data = self.columns[columnKey].getTransmissionBuffer();
        columndata.push(data);
        len += data.length;
        columnmetadata.push(self.columns[columnKey].metadata);
        chunkColumnCount++;
    }

    var total_chunk = Buffer.concat(columndata, len);

    console.log('Chunk count: ' + chunkColumnCount);
    zlib.deflate(total_chunk, function (err, compressed_chunk) {
        self.compressedChunkData = {
            chunkCount: chunkColumnCount,
            chunkDataLength: compressed_chunk.length,
            chunkData: compressed_chunk,
            metadata: columnmetadata
        };
        callback(self.compressedChunkData);
    });
};

Terrain.prototype.openLevel = function (levelName) {
    this.levelName = levelName;

    this.terrainPersister.loadDataIndex(levelName);
};

Terrain.prototype.loadTerrain = function (x, z, callback) {
    if (this.columns.hasOwnProperty(util.format('%d~%d', x, z))) {
        //Terrain is already loaded
        callback(this.columns[util.format('%d~%d', x, z)]);
        return;
    }

    this.terrainPersister.loadTerrainColumn(x, z, callback);
}

Terrain.prototype.saveTerrainColumn = function (column) {
    this.terrainPersister.saveTerrainColumn(column);
};

Terrain.prototype.buildColumnPacket = function (columnsRequested) {
    var self = this;
    var columnmetadata = [];
    var columndata = [];
    var len = 0;

    columnsRequested.forEach(function (columnRequest, idx) {
        for (var i = 0; i < self.columns.length; i++) {
            if (self.columns[i].x === columnRequest.x && self.columns[i].z === columnRequest.z) {
                var data = self.columns[i].getTransmissionBuffer();
                columndata.push(data);
                len += data.length;
                columnmetadata.push(this.columns[i].metadata);
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

Terrain.prototype.convertToLocal = function (position, chunkX, chunkZ) {
    return {
        x: (position.x - (chunkX * 16)) % 16,
        y: position.y,
        z: (position.z - (chunkZ * 16)) % 16
    };
};

Terrain.prototype.getBlock = function(position) {
    var chunkX = Math.floor(position.x / 16);
    var chunkZ = Math.floor(position.z / 16);

    var column = this.columns[util.format('%d~%d', chunkX, chunkZ)];
    return column.getBlock(this.convertToLocal(position, chunkX, chunkZ));
};

Terrain.prototype.setBlock = function (position, blockData) {
    var chunkX = Math.floor(position.x / 16);
    var chunkZ = Math.floor(position.z / 16);

    var column = this.columns[util.format('%d~%d', chunkX, chunkZ)];
    return column.setBlock(this.convertToLocal(position, chunkX, chunkZ), blockData);
};

Terrain.prototype.updateLight = function() {

};

module.exports = Terrain;