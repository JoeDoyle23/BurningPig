//Helpers to parse & write the buffers. Minecraft(Java) uses big endian for its numbers.

var util = require('util');
var int64 = require('node-int64');
var varint = require('varint');

var BinaryReader = function (buffer, start) {
    var self = this;

    if (!Buffer.isBuffer(buffer)) {
        return {};
    }

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
        var stringLength = varint.decode(buffer.slice(cursor.pos, cursor.pos+8));
        var stringLengthBytes = varint.decode.bytesRead;

        needs(stringLength);
        cursor.pos += stringLengthBytes;
        var result = buffer.toString('utf8', cursor.pos, cursor.pos + stringLength);

        cursor.pos += result.length;
        return result;
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

    self.readUShort = function () {
        needs(2);
        var value = buffer.readUInt16BE(cursor.pos);
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

    self.readVarint = function () {
        needs(1);
        var value = varint.decode(buffer.slice(cursor.pos, cursor.pos+8));
        cursor.pos += varint.decode.bytesRead;
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
        var data = { itemId: buffer.readInt16BE(cursor.pos) };
        cursor.pos += 2;

        if (data.itemId === -1) {
            return data;
        }

        needs(5);
        data.itemCount = self.readByte();
        data.itemDamage = self.readShort();
        var nbtLength = self.readShort();

        if(nbtLength===-1) {
            return data;
        }

        data.ntb = new Buffer(nbtLength);
        buffer.copy(data.nbt, 0, cursor.pos, nbtLength);
        cursor.pos += nbtLength;

        return data;
    };

    self.readArray = function (length) {
        var data = new Buffer(length);
        buffer.copy(data, 0, cursor.pos, cursor.pos + length);
        cursor.pos += length;
        return data;
    }

};

module.exports = BinaryReader;
