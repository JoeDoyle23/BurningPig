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
}

function AnvilChunk(x, z) {
    this.x = x;
    this.z = z

    //chunks in Y order, 0-256. No chunk entry means all air
    this.chunks = [];

    this.biomes = new Buffer(256);
    this.biomes.fill(1);

    this.metadata = {
      chunkX: this.x,
      chunkZ: this.z,
      primaryBitmap: 0,
      addBitmap: 0
    }
    
    this.generateTestColumn = function () {
        for (var i = 0; i < 4; i++) {
            this.chunks[i] = new Chunk(i);
        }
        
        this.metadata.primaryBitmap = 0x000F;
    };

    this.getTransmissionBuffer = function () {
        var b = [], m = [], l = [], s = [];
        var totalLength=0;
        
        for (var i = 0; i < this.chunks.length; i++) {
            b.push(this.chunks[i].blocks);
            totalLength +=this.chunks[i].blocks.length;
            m.push(this.chunks[i].metadata);
            totalLength +=this.chunks[i].metadata.length;
            l.push(this.chunks[i].light);
            totalLength +=this.chunks[i].light.length;
            s.push(this.chunks[i].skylight);
            totalLength +=this.chunks[i].skylight.length;
        }
        var all = b.concat(m, l, s);
        all.push(this.biomes);
        return Buffer.concat(all, totalLength+this.biomes.length);
    };
}

module.exports = AnvilChunk;