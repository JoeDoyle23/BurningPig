function Chunk(y) {
    this.y = y;
    this.blocks = new Buffer(4096);
    this.metadata = new Buffer(2048);
    this.light = new Buffer(2048);
    this.skylight = new Buffer(2048);

    //Right now chunks will be all dirt
    this.blocks.fill(3);
    this.metadata.fill(0);
    this.light.fill(0);
    this.skylight.fill(0xff);

    if (this.y === 0) {
        for (var bx = 0; bx < 16; bx++) {
            for (var bz = 0; bz < 16; bz++) {
                //Just the bottom row
                var index = bx + (bz * 16);
                this.blocks[index] = 7;
            }
        }
    }
}

Chunk.prototype.getBlock = function(index) {
    return {
        blockType: this.blocks[index],
        metadata: this.metadata[index / 2] >> ((index % 2) * 4) & 0xF,
        light: this.light[index / 2] >> ((index % 2) * 4) & 0xF,
        skylight: this.skylight[index / 2] >> ((index % 2) * 4) & 0xF
    };
};

Chunk.prototype.setBlock = function (index, blockData) {
    this.blocks[index] = blickData.blockType;

    blockData.metadata &= 0xF;
    this.metadata[index/2] &= (0xF << ((index + 1) % 2 * 4));
    this.metadata[index/2] |= (blockData.metadata << (index % 2 * 4));

    blockData.light &= 0xF;
    this.light[index/2] &= (0xF << ((index + 1) % 2 * 4));
    this.light[index/2] |= (blockData.light << (index % 2 * 4));

    blockData.skylight &= 0xF;
    this.skylight[index/2] &= (0xF << ((index + 1) % 2 * 4));
    this.skylight[index/2] |= (blockData.skylight << (index % 2 * 4));
};

function TerrainColumn(x, z) {
    this.x = x;
    this.z = z

    //chunks in Y order, 0-256. No chunk entry means all air
    this.chunks = [];

    this.heightmap = new Buffer(256);

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
    var blockIndex = position.x + (position.z * 16) + (localY * 256);

    return this.chunks[chunk].getBlock(blockIndex);
};

TerrainColumn.prototype.setBlock = function (position, blockData) {
    var chunk = Math.floor(position.y / 16);
    var chunkY = position.y % 16;
    var blockIndex = position.x + (position.z * 16) + (localY * 256);

    this.chunks[chunk].setBlock(blockIndex, blockData);
};

TerrainColumn.prototype.getTransmissionBuffer = function () {
    var b = [], m = [], l = [], s = [];
    var totalLength = 0;

    for (var i = 0; i < this.chunks.length; i++) {
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

module.exports = TerrainColumn;