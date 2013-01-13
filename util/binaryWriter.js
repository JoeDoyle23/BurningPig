var util = require('util');
var int64 = require('node-int64');

var BinaryWriter = function() {
  var self = this;
  var buffers = [];
  var totalLength = 0;
 
  self.result = function() {
	return Buffer.concat(buffers, totalLength);
  };

  var updateBuffers = function(buffer) {
	  buffers.push(buffer);
	  totalLength+=buffer.length;
  };
  
  self.writeString = function (data) {
      var stringBuf = new Buffer(data, 'binary');
	  var outBuffer = new Buffer(2 + data.length*2);
	  
      outBuffer.writeInt16BE(data.length, 0);
      for (var i = 0; i < data.length; i++) {
          outBuffer.writeInt16BE(stringBuf[i], (i*2)+2);
      }
	  
	  updateBuffers(outBuffer);
	  return self;
  };

  self.writeArray = function (data) {
      var outBuffer = new Buffer(data.length);
	  data.copy(outBuffer, 0);
      updateBuffers(outBuffer);
	  return self;
  };

  self.writeBool = function (data) {
      var value = data === true ? 0x01 : 0x00;
      var buffer = new Buffer(1)
	  buffer.writeUInt8(value, 0);
	  updateBuffers(buffer);
	  return self;
  };

  self.writeByte = function (data) {
      var buffer = new Buffer(1);
	  buffer.writeUInt8(data, 0);
	  updateBuffers(buffer);
	  return self;
  };
  
  self.writeSByte = function (data) {
      var buffer = new Buffer(1);
	  buffer.writeInt8(data, 0);
	  updateBuffers(buffer);
	  return self;
  };

  self.writeShort = function (data) {
      var buffer = new Buffer(2);
	  buffer.writeInt16BE(data, 0);
	  updateBuffers(buffer);
	  return self;
  };

  self.writeUShort = function (data) {
      var buffer = new Buffer(2);
	  buffer.writeUInt16BE(data, 0);
	  updateBuffers(buffer);
	  return self;
  };

  self.writeInt = function (data) {
      var buffer = new Buffer(4);
	  buffer.writeInt32BE(data, 0);
	  updateBuffers(buffer);
	  return self;
  };

  self.writeFloat = function (data) {
      var buffer = new Buffer(4);
	  buffer.writeFloatBE(data, 0);
	  updateBuffers(buffer);
	  return self;
  };

  self.writeDouble = function (data) {
      var buffer = new Buffer(8);
	  buffer.writeDoubleBE(data, 0);
	  updateBuffers(buffer);
	  return self;
  };

  self.writeLong = function (data) {
	var outBuffer = new Buffer(8);
    data.buffer.copy(outBuffer, 0);
    updateBuffers(outBuffer);
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

	  self.writeArray(data.metaData);

      return self;
  };

  self.writeMetaData = function (data) {
	  if(!data) {
		  //TODO: general metadata
		  self.writeShort(0x0000);
		  self.writeByte(0x7F);
		  return self;
	  }
	
	  buffer.writeByte(((data.type << 5) | index), cursor.pos);
	  cursor.pos += 1;
	  switch(type) {
		case 5:
		self.writeSlot(data.data);
		return self;
	  };	  	  
	  
	  return self;
  }

};

module.exports = BinaryWriter;