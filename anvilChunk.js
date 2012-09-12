var zlib = require('zlib');

function Chunk(y) {
    this.y = y;
    this.blocks = new Buffer(4096);
    this.metadata = new Buffer(2048);
    this.light = new Buffer(2048);
    this.skylight = new Buffer(2048);

    //Right now chunks will be all dirt
    this.blocks.fill(3);
    this.metadata.fill(0);
    this.light.fill(0xff);
    this.skylight.fill(0xff);

    this.getTransmissionBuffer = function () {
        return Buffer.concat([this.blocks, this.metadata, this.light, this.skylight], 10240);
    }
}


function AnvilChunk(x, z) {
    this.x = x;
    this.z = z
    this.biome = new Buffer(256);
    this.biome.fill(1);

    //chunks in Y order, 0-256. No chunk entry means all air
    this.chunks = [];

    this.metadata = {
        chunkX: x,
        chunkZ: z,
        primaryBitmap: 0xFFFF,
        addBitmap: 0
    };

    this.generateTestColumn = function () {
        for (var i = 0; i < 4; i++) {
            var chunk = new Chunk(i);
            this.chunks[i] = chunk;
        }
    };

    this.getTransmissionBuffer = function () {
        var chunkArray = [];
        for (var i = 0; i < 4; i++) {
            chunkArray.push(this.chunks[i].getTransmissionBuffer());
        }
        chunkArray.push(this.biome);
        return Buffer.concat(chunkArray, (10240 * 4) + 256);
    };
}

module.exports = AnvilChunk;