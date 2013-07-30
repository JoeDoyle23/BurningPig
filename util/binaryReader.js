//Helpers to parse & write the buffers.  Java uses big endian for its numbers.

var util = require('util');
var int64 = require('node-int64');

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
