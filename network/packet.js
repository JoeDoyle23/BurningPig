﻿var util = require('util');
var int64 = require('node-int64');

var Packet = function(size) {
  this.buffer = new Buffer(size);
  this.cursor = 0;
};

Packet.prototype.result = function() {
  	return this.buffer;
};
  
Packet.prototype.getPosition = function() {
    return this.cursor;
};

Packet.prototype.writeString = function (data) {
    var stringBuf = new Buffer(data, 'binary');

    this.writeShort(data.length);
    for (var i = 0; i < data.length; i++) {
        this.writeShort(stringBuf[i]);
    }

    return this;
};

Packet.prototype.writeArray = function (data) {
    data.copy(this.buffer, this.cursor);
    this.cursor += data.length;
	return this;
  };

Packet.prototype.writeBool = function (data) {
    var value = data === true ? 1 : 0;
    this.buffer.writeUInt8(value, this.cursor);
    this.cursor++;
    return this;
};

Packet.prototype.writeByte = function (data) {
    this.buffer.writeUInt8(data, this.cursor);
    this.cursor++;
	return this;
};
  
Packet.prototype.writeSByte = function (data) {
    this.buffer.writeInt8(data, this.cursor);
    this.cursor++;
    return this;
};

Packet.prototype.writeShort = function (data) {
    this.buffer.writeInt16BE(data, this.cursor);
    this.cursor += 2;
	return this;
};

Packet.prototype.writeUShort = function (data) {
    this.buffer.writeUInt16BE(data, this.cursor);
    this.cursor += 2;
	return this;
};

Packet.prototype.writeInt = function (data) {
    this.buffer.writeInt32BE(data, this.cursor);
    this.cursor += 4;
	return this;
};

Packet.prototype.writeFloat = function (data) {
    this.buffer.writeFloatBE(data, this.cursor);
    this.cursor += 4;
    return this;
};

Packet.prototype.writeDouble = function (data) {
    this.buffer.writeDoubleBE(data, this.cursor);
    this.cursor += 8;
    return this;
};

Packet.prototype.writeLong = function (data) {
    data.buffer.copy(this.buffer, this.cursor);
    this.cursor += 8;
    return this;
};

Packet.prototype.writeSlot = function (data) {
    this.writeShort(data.itemId);

    if (data.itemId === -1) {
        return this;
    }

    this.writeByte(data.count);
    this.writeShort(data.damage);
    this.writeShort(data.metadata.length);

    if (data.metadata.length === 0) {
        return this;
    }

    this.writeMetadata(data.metadata);

    return this;
};

Packet.prototype.writeMetadata = function (data) {
    if(!data || data.length===0) {
	    this.writeShort(0x0000);
	    this.writeByte(0x7F);
	    return this;
    }

    for(var i=0,j=data.length;i<j;i++) {
        this.writeByte(((data[i].type << 5) | i), this.cursor);
        this.cursor += 1;
        switch(data[i].type) {
            case 0:
                this.writeByte(data[i].data);
                break;
            case 1:
                this.writeShort(data[i].data);
                break;
            case 2:
                this.writeInt(data[i].data);
                break;
            case 3:
                this.writeFloat(data[i].data);
                break;
            case 4:
                this.writeString(data[i].data);
                break;
            case 5:
                this.writeSlot(data[i].data);
                break;
        };
    }

    return this;
};

module.exports = Packet;