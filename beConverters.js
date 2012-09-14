//Helpers to parse & write the buffers.  Java uses big endian for its numbers.

var util = require('util');
var int64 = require('node-int64');

var BinaryWriter = function(buffer, start) {
  var self = this;

  var cursor = {pos: start || 0};

  self.getPosition = function() {
    return cursor.pos;
  };

  self.writeString = function (data) {
      var stringBuf = new Buffer(data, 'ascii');

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
      buffer.write(Int16BE(data.blockId, cursor.pos));
      cursor.pos += 2;

      if (data.blockId === -1) {
          return;
      }

      self.writeShort(data.itemCount);
      self.writeShort(data.itemDamage);
      self.writeShort(data.metaData.length);

      if (data.metaData.length === -1) {
          return data;
      }

      data.metaData.copy(buffer, cursor.pos, 0, metaDataLength);
      cursor.pos += data.metaData.length;

      return data;
  };

  self.writeMetaData = function (data) {
      //TODO: metadata
      buffer.writeInt32BE(0x4800, cursor.pos);
      cursor.pos += 4;
      buffer.writeInt32BE(0x7F, cursor.pos);
      cursor.pos += 4;

  }

};

var BinaryReader = function (buffer, start) {
    var self = this;

    var cursor = { pos: start || 0 };

    var needs = function (needsBytes) {
        //console.log('needs: ' + needsBytes + ' has: ' + (buffer.length - cursor.pos));
        if (buffer.length - cursor.pos < needsBytes) {
            throw Error("oob");
        }
    };

    self.getBuffer = function() {
      return buffer;
    }

    self.getPosition = function () {
        return cursor.pos;
    };

    self.readString = function () {
        needs(2);
        var length = buffer.readUInt16BE(cursor.pos);
        cursor.pos += 2;
        needs(length * 2);
        var result = new Buffer(length);
        for (var i = 0; i < length; i++) {
            result[i] = buffer.readUInt8(cursor.pos + (i * 2) + 1);
        }

        cursor.pos += length * 2;
        return result.toString();
    };

    self.readByte = function () {
        needs(1);
        var value = buffer.readUInt8(cursor.pos);
        cursor.pos++;
        return value;
    },

    self.readSByte = function () {
        needs(1);
        var value = buffer.readInt8(cursor.pos);
        cursor.pos++;
        return value;
    },

    self.readShort = function () {
        needs(2);
        var value = buffer.readInt16BE(cursor.pos);
        cursor.pos += 2;
        return value;
    };

    self.readInt = function () {
        needs(4);
        var value = buffer.readInt32BE(cursor.pos);
        cursor.pos += 4;
        return value;
    };

    self.readFloat = function () {
        needs(4);
        var value = buffer.readFloatBE(cursor.pos);
        cursor.pos += 4;
        return value;
    };

    self.readDouble = function () {
        needs(8);
        var value = buffer.readDoubleBE(cursor.pos);
        cursor.pos += 8;
        return value;
    };

    self.readBool = function () {
        needs(1);
        var value = buffer.readInt8(cursor.pos);
        cursor.pos++;
        return value===1;
    };

    self.readSlot = function () {
        needs(2);
        var data = { blockId: buffer.readInt16BE(cursor.pos) };
        cursor.pos += 2;

        if (data.blockId === -1) {
            return data;
        }

        needs(6);
        data.itemCount = self.readShort();
        data.itemDamage = self.readShort();
        var metaDataLength = self.readShort();

        if(metaDataLength===-1) {
            return data;
        }

        data.metaData = new Buffer(metaDataLength);
        buffer.copy(data.metaData, 0, cursor.pos, metaDataLength);
        cursor.pos += metaDataLength;

        return data;
    };

    self.readArray = function (length) {
        var data = new Buffer(length);
        buffer.copy(data, 0, cursor.pos, length);
        return data;
    }

};

module.exports.BinaryReader = BinaryReader;
module.exports.BinaryWriter = BinaryWriter;