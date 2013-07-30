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
    //console.log('get:index: %d', index);
    return {
        blockType: this.blocks[index],
        metadata: this.metadata[index / 2] >> ((index % 2) * 4) & 0xF,
        light: this.light[index / 2] >> ((index % 2) * 4) & 0xF,
        skylight: this.skylight[index / 2] >> ((index % 2) * 4) & 0xF
    };
};

Chunk.prototype.setBlock = function (index, blockData) {
    //console.log('set:index: %d', index);
    //console.log('blockType: %d', blockData.blockType);
    this.blocks[index] = blockData.blockType;

    blockData.metadata &= 0xF;
    this.metadata[index/2] &= (0xF << (((index + 1) % 2) * 4));
    this.metadata[index/2] |= (blockData.metadata << ((index % 2) * 4));

    blockData.light &= 0xF;
    this.light[index/2] &= (0xF << (((index + 1) % 2) * 4));
    this.light[index/2] |= (blockData.light << ((index % 2) * 4));

    blockData.skylight &= 0xF;
    this.skylight[index/2] &= (0xF << (((index + 1) % 2) * 4));
    this.skylight[index/2] |= (blockData.skylight << ((index % 2) * 4));
};

Chunk.prototype.getHighestBlock = function (x, z) {
    for (var y = 15; y >= 0; y--) {
        var blockIndex = x + (z * 16) + (y * 256);
        if (this.getBlock(blockIndex).blockType != 0) {
            return y;
        }
    }

    return -1;
};

module.exports = Chunk;