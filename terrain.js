var fs = require('fs');
var util = require('util');
var zlib = require('zlib');
var TerrainColumn = require('./terrainColumn');


function Terrain() {
    var self = this;

    this.levelName = '';
    this.columns = [];

    this.terrainDataIndex = {};
    this.terrainData = {};

    this.levelDataFile = {};

    self.compressedChunkData = {};

    self.openLevel('testWorld');

    self.loadTerrain(0, 0, 5, function () { });

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

    for (var i = 0; i < 100; i++) {
        var data = this.columns[i].column.getTransmissionBuffer();
        columndata.push(data);
        len += data.length;
        columnmetadata.push(this.columns[i].column.metadata);
    }

    var total_chunk = Buffer.concat(columndata, len);

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

Terrain.prototype.openLevel = function (levelName) {
    this.levelName = levelName;

    this.loadDataIndex();

    this.levelDataFile = fs.openSync('./levels/testWorld.terrain', 'a+');

};

Terrain.prototype.loadDataIndex = function () {
    var indexBuffer = fs.readFileSync('./levels/' + this.levelName + '.index');
    var pos=0;
    for (var i = 0; i < indexBuffer.length / 12; i++) {
        var indexEntry = {
            x: indexBuffer.readInt32LE(pos),
            z: indexBuffer.readInt32LE(pos+4),
            position: indexBuffer.readInt32LE(pos+8),
        }
        pos += 12;
        this.terrainDataIndex[util.format('%d~%d', indexEntry.x, indexEntry.z)] = indexEntry;
    }

    console.log('Loaded %d terrain index entries'.green, i);
};

Terrain.prototype.loadTerrain = function (x, z, radius, callback) {
    for (var tx = x - radius; tx < x + radius; tx++) {
        for (var tz = z - radius; tz < z + radius; tz++) {
            if (this.terrainData.hasOwnProperty(util.format('%d~%d', tx, tz))) {
                //Terrain is already loaded
                callback();
                continue;
            }

            if (this.terrainDataIndex.hasOwnProperty(util.format('%d~%d', tx, tz))) {
                var indexEntry = this.terrainDataIndex[util.format('%d~%d', tx, tz)];
                var column = new TerrainColumn(tx, tz);

                var terrainData = new Buffer(164362);
                fs.readSync(this.levelDataFile, terrainData, 0, 164362, indexEntry.position);
                var pos = 8;

                column.metadata.primaryBitmap = terrainData.readInt16LE(pos);
                pos += 2;
                var chunkBitmap = column.metadata.primaryBitmap;

                terrainData.copy(column.heightmap, 0, pos, pos+256);
                pos += 256;
                terrainData.copy(column.biomes, 0, pos, pos + 256);
                pos += 256;

                for (var j = 0; j < 16; j++) {
                    if ((chunkBitmap & 1) === 1) {
                        var currentChunk = column.getNewChunk(j);
                        terrainData.copy(currentChunk.blocks, 0, pos, pos + 4096);
                        pos += 4096;
                        terrainData.copy(currentChunk.metadata, 0, pos, pos + 2048);
                        pos += 2048;
                        terrainData.copy(currentChunk.light, 0, pos, pos + 2048);
                        pos += 2048;
                        terrainData.copy(currentChunk.skylight, 0, pos, pos + 2048);
                        pos += 2048;
                        column.chunks[j] = currentChunk;

                    } else {
                        pos += 10240;
                    }
                    chunkBitmap = chunkBitmap >> 1;
                }

                this.columns.push({ x: tx, z: tz, column: column });
                callback();
            }
        }
    }
}

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

//Just for creating our test world.
Terrain.prototype.testSaveTerrain = function () {
    var indexBuffer = new Buffer(1200);
    var ipos = 0;
    var count = 0;

    var terrainFile = fs.openSync('./levels/testWorld.terrain', 'w');

    for (var i = 0; i < 100; i++) {
        var data = this.columns[i];

        indexBuffer.writeInt32LE(data.x, ipos);
        ipos += 4;
        indexBuffer.writeInt32LE(data.z, ipos);
        ipos += 4;
        indexBuffer.writeInt32LE(count * 164362, ipos);
        ipos += 4;
        console.log('ipos - %d', ipos);

        var columnBuffer = new Buffer(164362);
        var pos = 0;

        columnBuffer.writeInt32LE(data.chunk.x, pos);
        pos += 4;
        columnBuffer.writeInt32LE(data.chunk.z, pos);
        pos += 4;
        columnBuffer.writeInt16LE(data.chunk.metadata.primaryBitmap, pos);
        pos += 2;
        data.chunk.heightmap.copy(columnBuffer, pos, 0, 256);
        pos += 256;
        data.chunk.biomes.copy(columnBuffer, pos, 0, 256);
        pos += 256;

        var chunkBitmap = data.chunk.metadata.primaryBitmap;
        for (var j = 0; j < 16; j++) {
            if ((chunkBitmap & 1) === 1) {
                var currentChunk = data.chunk.chunks[j];
                currentChunk.blocks.copy(columnBuffer, pos, 0, 4096);
                pos += 4096;
                currentChunk.metadata.copy(columnBuffer, pos, 0, 2048);
                pos += 2048;
                currentChunk.light.copy(columnBuffer, pos, 0, 2048);
                pos += 2048;
                currentChunk.skylight.copy(columnBuffer, pos, 0, 2048);
                pos += 2048;

            } else {
                pos += 10240;
            }
            chunkBitmap = chunkBitmap >> 1;
        }

        fs.writeSync(terrainFile, columnBuffer, 0, 164362, count * 164362);
        count++;
    }
    
    fs.writeFile('./levels/testWorld.index', indexBuffer);
    fs.closeSync(terrainFile);
};

module.exports = Terrain;