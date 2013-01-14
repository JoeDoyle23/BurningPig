var util = require('util');
var int64 = require('node-int64');

var Packet = function(size) {
  var self = this;
  var buffer = new Buffer(size);
  var cursor = 0;

  self.result = function() {
	return buffer;
  };
  
  self.getPosition = function() {
    return cursor;
  };

  self.writeString = function (data) {
      var stringBuf = new Buffer(data, 'binary');

      self.writeShort(data.length);
      for (var i = 0; i < data.length; i++) {
		self.writeShort(stringBuf[i]);
      }
	  
	  return self;
  };

  self.writeArray = function (data) {
      data.copy(buffer, cursor);
      cursor += data.length;
	  return self;
  };

  self.writeBool = function (data) {
      var value = data === true ? 1 : 0;
      buffer.writeUInt8(value, cursor);
      cursor++;
	  return self;
  };

  self.writeByte = function (data) {
      buffer.writeUInt8(data, cursor);
      cursor++;
	  return self;
  };
  
  self.writeSByte = function (data) {
      buffer.writeInt8(data, cursor);
      cursor++;
	  return self;
  };

  self.writeShort = function (data) {
      buffer.writeInt16BE(data, cursor);
      cursor += 2;
	  return self;
  };

  self.writeUShort = function (data) {
      buffer.writeUInt16BE(data, cursor);
      cursor += 2;
	  return self;
  };

  self.writeInt = function (data) {
      buffer.writeInt32BE(data, cursor);
      cursor += 4;
	  return self;
  };

  self.writeFloat = function (data) {
      buffer.writeFloatBE(data, cursor);
      cursor += 4;
	  return self;
  };

  self.writeDouble = function (data) {
      buffer.writeDoubleBE(data, cursor);
      cursor += 8;
	  return self;
  };

  self.writeLong = function (data) {
      data.buffer.copy(buffer, cursor);
      cursor += 8;
	  return self;
  };

  self.writeSlot = function (data) {
      self.writeShort(data.itemId);

      if (data.itemId === -1) {
          return self;
      }

      self.writeByte(data.count);
      self.writeShort(data.damage);
      self.writeShort(data.metaData.length);

      if (data.metaData.length === -1) {
          return self;
      }

      data.metaData.copy(buffer, cursor, 0, metaDataLength);
      cursor += data.metaData.length;

      return self;
  };

  self.writeMetaData = function (data) {
	  if(!data) {
		  //TODO: general metadata
		  self.writeShort(0x0000);
		  self.writeByte(0x7F);
		  return self;
	  }
	
	  buffer.writeByte(((data.type << 5) | index), cursor);
	  cursor += 1;
	  switch(type) {
		case 5:
		self.writeSlot(data.data);
		return self;
	  };	  	  
  }

};

module.exports = Packet;