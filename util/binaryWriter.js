var util = require('util');
var int64 = require('node-int64');

var BinaryWriter = function(buffer, start) {
  var self = this;

  var cursor = {pos: start || 0};

  self.getPosition = function() {
    return cursor.pos;
  };

  self.writeString = function (data) {
      var stringBuf = new Buffer(data, 'binary');

      buffer.writeInt16BE(data.length, cursor.pos);
      cursor.pos += 2;
      for (var i = 0; i < data.length; i++) {
          buffer.writeInt16BE(stringBuf[i], cursor.pos);
          cursor.pos += 2;
      }
  };

  self.writeArray = function (data) {
      data.copy(buffer, cursor.pos);
      cursor.pos += data.length;
  };

  self.writeBool = function (data) {
      var value = data === true ? 1 : 0;
      buffer.writeUInt8(value, cursor.pos);
      cursor.pos++;
  };

  self.writeByte = function (data) {
      buffer.writeUInt8(data, cursor.pos);
      cursor.pos++;
  };
  
  self.writeSByte = function (data) {
      buffer.writeInt8(data, cursor.pos);
      cursor.pos++;
  };

  self.writeShort = function (data) {
      buffer.writeInt16BE(data, cursor.pos);
      cursor.pos += 2;
  };

  self.writeUShort = function (data) {
      buffer.writeUInt16BE(data, cursor.pos);
      cursor.pos += 2;
  };

  self.writeInt = function (data) {
      buffer.writeInt32BE(data, cursor.pos);
      cursor.pos += 4;
  };

  self.writeFloat = function (data) {
      buffer.writeFloatBE(data, cursor.pos);
      cursor.pos += 4;
  };

  self.writeDouble = function (data) {
      buffer.writeDoubleBE(data, cursor.pos);
      cursor.pos += 8;
  };

  self.writeLong = function (data) {
      data.buffer.copy(buffer, cursor.pos);
      cursor.pos += 8;
  };

  self.writeSlot = function (data) {
      self.writeShort(data.itemId);

      if (data.itemId === -1) {
          return;
      }

      self.writeByte(data.count);
      self.writeShort(data.damage);
      self.writeShort(data.metaData.length);

      if (data.metaData.length === -1) {
          return;
      }

      data.metaData.copy(buffer, cursor.pos, 0, metaDataLength);
      cursor.pos += data.metaData.length;

      return;
  };

  self.writeMetaData = function (data) {
	  if(!data) {
		  //TODO: general metadata
		  buffer.writeInt16BE(0x0000, cursor.pos);
		  cursor.pos += 2;
		  buffer.writeByte(0x7F, cursor.pos);
		  cursor.pos += 1;
		  return;
	  }
	
	  buffer.writeByte(((data.type << 5) | index), cursor.pos);
	  cursor.pos += 1;
	  switch(type) {
		case 5:
		self.writeSlot(data.data);
		return;
	  };	  	  
  }

};

module.exports = BinaryWriter;