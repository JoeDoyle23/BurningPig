var lightEmit = new Buffer(175),
    lightBlock = new Buffer(175);


lightEmit.fill(0);
lightBlock.fill(15);

lightEmit[0x0a] = 15;
lightEmit[0x0b] = 15;
lightEmit[0x27] = 1;
lightEmit[0x32] = 14;
lightEmit[0x33] = 15;
lightEmit[0x3e] = 14;
lightEmit[0x4a] = 9;
lightEmit[0x4c] = 7;
lightEmit[0x59] = 15;
lightEmit[0x5a] = 11;
lightEmit[0x5b] = 15;
lightEmit[0x7a] = 1;
lightEmit[0x7c] = 15;
lightEmit[0x82] = 7;
lightEmit[0x8a] = 15;

lightBlock[0x00] = 0;
lightBlock[0x06] = 0;
lightBlock[0x08] = 3;
lightBlock[0x09] = 3;
lightBlock[0x12] = 2;
lightBlock[0x14] = 0;
lightBlock[0x25] = 0;
lightBlock[0x26] = 0;
lightBlock[0x27] = 0;
lightBlock[0x28] = 0;
lightBlock[0x32] = 0;
lightBlock[0x33] = 0;
lightBlock[0x34] = 0;
lightBlock[0x35] = 7;
lightBlock[0x37] = 0;
lightBlock[0x40] = 0;
lightBlock[0x41] = 0;
lightBlock[0x42] = 0;
lightBlock[0x43] = 7;
lightBlock[0x44] = 0;
lightBlock[0x45] = 0;
lightBlock[0x46] = 0;
lightBlock[0x47] = 0;
lightBlock[0x48] = 0;
lightBlock[0x4b] = 0;
lightBlock[0x4c] = 0;
lightBlock[0x4d] = 0;
lightBlock[0x4e] = 0;
lightBlock[0x4f] = 3;
lightBlock[0x53] = 0;
lightBlock[0x55] = 0;
lightBlock[0x56] = 7;
lightBlock[0x5a] = 0;
lightBlock[0x5b] = 7;
lightBlock[0x5c] = 7;

module.exports.lightEmit = lightEmit;
module.exports.lightBlock = lightBlock;
