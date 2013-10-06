var lightValues = require('./lightValues');

function Chunk(y) {
    this.y = y;
    this.blocks = new Buffer(4096);
    this.metadata = new Buffer(2048);
    this.light = new Buffer(2048);
    this.skylight = new Buffer(2048);

    //chunks will be all dirt for testing
    //this.blocks.fill(3);
    this.blocks.fill(0);
    this.metadata.fill(0);
    this.light.fill(0);
    this.skylight.fill(0);

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

Chunk.prototype.getBlock = function(x, y, z) {
    //console.log('get:index: %d', index);
    var index = x + (z << 4) + (y << 8);
    return {
        blockType: this.blocks[index],
        metadata: this.getBlockMetadata(x, y, z),
        light: this.getBlockLight(x, y, z),
        skylight: this.getBlockSkyLight(x, y, z)
    };
};

Chunk.prototype.setBlock = function (x, y, z, blockData) {
    var index = x + (z << 4) + (y << 8);

    this.blocks[index] = blockData.blockType;

    this.setBlockMetadata(x, index, blockData.metadata);
    this.setBlockLight(x, index, blockData.light);
    this.setBlockSkyLight(x, index, blockData.skylight);
};

Chunk.prototype.setBlockType = function (x, y, z, blockType) {
    var index = x + (z << 4) + (y << 8);

    this.blocks[index] = blockType;
};

Chunk.prototype.getBlockMetadata = function (x, y, z) {
    var index = x + (z << 4) + (y << 8);
    return getNibbleValue(this.metadata, x, index);
};

Chunk.prototype.setBlockMetadata = function (x, y, z, metadata) {
    var index = x + (z << 4) + (y << 8);
    metadata &= 0xF;
    setNibbleValue(this.metadata, x, index, metadata);
};

Chunk.prototype.getBlockLight = function (x, y, z) {
    var index = x + (z << 4) + (y << 8);
    return getNibbleValue(this.light, x, index);
};

Chunk.prototype.setBlockLight = function (x, y, z, light) {
    var index = x + (z << 4) + (y << 8);
    light &= 0xF;
    setNibbleValue(this.light, x, index, light);
};

Chunk.prototype.getBlockSkyLight = function (x, y, z) {
    var index = x + (z << 4) + (y << 8);
    return getNibbleValue(this.skylight, x, index);
};

Chunk.prototype.setBlockSkyLight = function (x, y, z, skylight) {
    var index = x + (z << 4) + (y << 8);
    skylight &= 0xF;
    setNibbleValue(this.skylight, x, index, skylight);
};

Chunk.prototype.getHighestBlock = function (x, z) {
    for (var y = 15; y >= 0; y--) {
        var blockIndex = x + (z << 4) + (y << 8);
        if (this.getBlock(blockIndex).blockType != 0) {
            return y;
        }
    }

    return -1;
};

Chunk.prototype.initialSkyLight = function() {
  var light;

    for (var x = 0; x < 16; ++x) {
        for (var z = 0; z < 16; ++z) {
            light = 15;

            for (var y = 15; y >= 0; --y) {
                var block = this.getBlock(x, y, z);
                light -= lightValues.lightBlock[block.blockType];

                if (light <= 0) {
                    break; 
                }

                if (block.skylight !== light) {
                    this.setBlockSkyLight(x, y, z, light);
                }
            }
        }
    }
};

Chunk.prototype.initialLight = function() {
    for (var x = 0; x < 16; ++x) {
        for (var z = 0; z < 16; ++z) {
            for (var y = 0; y < 16; ++y) {
                var block = this.getBlock(x, y, z);
                var light = lightValues.lightEmit[block.blockType];

                if (!light) { 
                    this.setBlockLight(x, y, z, light);
                    continue; 
                }
            
                if(block.light !== light) {
                    this.setBlockLight(x, y, z, light);
                }
            }
        }
    }
};

function setNibbleValue(buffer, x, index, value) {
    if (x % 2) {
        buffer[index] &= 0x0f;
        buffer[index] |= (value << 4);
    } else {
        buffer[index] &= 0xf0;
        buffer[index] |= (value & 0x0f);
    }
}

function getNibbleValue(buffer, x, index) {
    if (x % 2) {
        return buffer[index] >> 4;
    } else {
        return buffer[index] & 0x0f;
    }
}


module.exports = Chunk;