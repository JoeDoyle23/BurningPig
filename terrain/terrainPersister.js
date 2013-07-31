var fs = require('fs');
var util = require('util');
var TerrainColumn = require('./terrainColumn');

function TerrainPersister() {
    this.terrainDataIndex = {};
};

TerrainPersister.prototype.loadDataIndex = function (levelName) {
    var indexBuffer = fs.readFileSync('./levels/' + levelName + '.index');

    var pos = 0;
    for (var i = 0; i < indexBuffer.length / 12; i++) {
        var indexEntry = {
            x: indexBuffer.readInt32LE(pos),
            z: indexBuffer.readInt32LE(pos + 4),
            position: indexBuffer.readInt32LE(pos + 8),
        }
        pos += 12;
        this.terrainDataIndex[util.format('%d~%d', indexEntry.x, indexEntry.z)] = indexEntry;
    }

    console.log('Loaded %d terrain index entries'.green, i);
};

TerrainPersister.prototype.loadTerrainColumn = function (x, z, callback) {
    var self = this;

    fs.open('./levels/testWorld.terrain', 'r+', function (err, levelDataFile) {

        if (self.terrainDataIndex.hasOwnProperty(util.format('%d~%d', x, z))) {
            var terrainDataPosition = self.terrainDataIndex[util.format('%d~%d', x, z)].position;

            var column = new TerrainColumn(x, z);

            var terrainData = new Buffer(164362);
            fs.read(levelDataFile, terrainData, 0, 164362, terrainDataPosition, function (err, bytesRead) {
                var pos = 8;

                column.metadata.primaryBitmap = terrainData.readInt16LE(pos);
                pos += 2;
                var chunkBitmap = column.metadata.primaryBitmap;
                //console.log(chunkBitmap);
                terrainData.copy(column.heightmap, 0, pos, pos + 256);
                pos += 256;
                terrainData.copy(column.biomes, 0, pos, pos + 256);
                pos += 256;

                for (var j = 0; j < 16; j++) {
                    if (chunkBitmap & 1 === 1) {
                        //console.log("Loading a chunk at " + j);
                        var currentChunk = column.getNewChunk(j);
                        terrainData.copy(currentChunk.blocks, 0, pos, pos + 4096);
                        pos += 4096;
                        terrainData.copy(currentChunk.metadata, 0, pos, pos + 2048);
                        pos += 2048;
                        terrainData.copy(currentChunk.light, 0, pos, pos + 2048);
                        pos += 2048;
                        terrainData.copy(currentChunk.skylight, 0, pos, pos + 2048);
                        pos += 2048;
                        
                        //currentChunk.initialSkyLight();
                        //currentChunk.initialLight();
                        
                        column.chunks[j] = currentChunk;
                    } else {
                        pos += 10240;
                    }
                    chunkBitmap = chunkBitmap >> 1;
                }

                callback(column);
                fs.close(levelDataFile);
                //self.saveTerrainColumn(column);
            });
        } else {
            //it needs to be generated
            //TODO: generate terrain!
        }

    });
}

TerrainPersister.prototype.saveTerrainColumn = function (column) {
    var self = this;
    console.log('Saving column: %d, %d'.yellow, column.x, column.z);

    var indexEntry = self.terrainDataIndex[util.format('%d~%d', column.x, column.z)];
    var terrainFile = fs.createWriteStream('./levels/testWorld.terrain', { flags: 'r+', start: indexEntry.position });

    var emptyChunkBuffer = new Buffer(10240);
    emptyChunkBuffer.fill(0);

    var columnBuffer = new Buffer(10);
    columnBuffer.writeInt32LE(column.x, 0);
    columnBuffer.writeInt32LE(column.z, 4);
    columnBuffer.writeInt16LE(column.metadata.primaryBitmap, 8);

    terrainFile.write(columnBuffer);
    terrainFile.write(column.heightmap);
    terrainFile.write(column.biomes);

    var chunkBitmap = column.metadata.primaryBitmap;
    for (var j = 0; j < 16; j++) {
        if (chunkBitmap & 1 === 1) {
            //console.log("Saving a chunk at " + j);
            var currentChunk = column.chunks[j];
            terrainFile.write(currentChunk.blocks);
            terrainFile.write(currentChunk.metadata);
            terrainFile.write(currentChunk.light);
            terrainFile.write(currentChunk.skylight);
        } else {
            terrainFile.write(emptyChunkBuffer);
        }
        chunkBitmap = chunkBitmap >> 1;
    }

    terrainFile.end();
    column.isSaved = true;
};

module.exports = TerrainPersister;