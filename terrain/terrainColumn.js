var Chunk = require('./chunk');

function TerrainColumn(x, z) {
    this.x = x;
    this.z = z

    //chunks in Y order, 0-16 No chunk entry means all air
    this.chunks = [];

    this.heightmap = new Buffer(256);
    this.isSaved = true;

    this.biomes = new Buffer(256);
    this.biomes.fill(1);

    this.metadata = {
        chunkX: this.x,
        chunkZ: this.z,
        primaryBitmap: 0,
        addBitmap: 0
    }
}

TerrainColumn.prototype.getNewChunk = function (y) {
    this.metadata.primaryBitmap |= 1 << y;
    return new Chunk(y);
};

TerrainColumn.prototype.generateTestColumn = function () {
    for (var i = 0; i < 4; i++) {
        this.chunks[i] = new Chunk(i);
    }

    this.metadata.primaryBitmap = 0x000F;
};

TerrainColumn.prototype.getBlock = function (position) {
    var chunk = Math.floor(position.y / 16);
    var chunkY = position.y % 16;

    console.log('chunk: ' + chunk);
    return this.chunks[chunk].getBlock(position.x, chunkY, position.z);
};

TerrainColumn.prototype.setBlock = function (position, blockData) {
    var chunk = Math.floor(position.y / 16);
    var chunkY = position.y % 16;

    this.isSaved = false;

    console.log(position);

    if(!this.chunks[chunk]) {
        console.log('Created new chunk at: ' + chunk);
        this.chunks[chunk] = this.getNewChunk(chunk);
    }

    this.chunks[chunk].setBlock(position.x, chunkY, position.z, blockData);
};

TerrainColumn.prototype.getTransmissionBuffer = function () {
    var b = [], m = [], l = [], s = [];
    var totalLength = 0;

    //console.log(this.chunks.length);
    for (var i = 0; i < 16; i++) {
        if(!this.chunks[i]) {
            continue;
        }

        b.push(this.chunks[i].blocks);
        totalLength += this.chunks[i].blocks.length;
        m.push(this.chunks[i].metadata);
        totalLength += this.chunks[i].metadata.length;
        l.push(this.chunks[i].light);
        totalLength += this.chunks[i].light.length;
        s.push(this.chunks[i].skylight);
        totalLength += this.chunks[i].skylight.length;
    }
    var all = b.concat(m, l, s);
    all.push(this.biomes);
    return Buffer.concat(all, totalLength + this.biomes.length);
};

TerrainColumn.prototype.updateHeightMap = function (position) {

};

module.exports = TerrainColumn;