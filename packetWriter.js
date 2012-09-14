var BinaryWriter = require('./beConverters').BinaryWriter;

var PacketWriter = function() {
  var self = this;
  
  var builders = [];

  builders[0x00] = function (data) {
      var packet = new Buffer(5);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x00);
      binaryWriter.writeInt(data.keepAliveId);

      return packet;
  };

  builders[0x01] = function(data) {
    var packet = new Buffer(26);
    var binaryWriter = new BinaryWriter(packet);

    binaryWriter.writeByte(0x01);
    binaryWriter.writeInt(data.entityId);
    binaryWriter.writeString("default");
    binaryWriter.writeByte(data.gameMode);
    binaryWriter.writeByte(data.dimension);
    binaryWriter.writeByte(data.difficulty);
    binaryWriter.writeByte(0);
    binaryWriter.writeByte(data.maxPlayers);

    return packet;
  };

  builders[0x03] = function (data) {
      var packet = new Buffer(3 + data.message.length*2);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x03);
      binaryWriter.writeString(data.message);

      return packet;
  };

  builders[0x04] = function (data) {
      var packet = new Buffer(9);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x04);
      binaryWriter.writeArray(data.time);

      return packet;
  };

  builders[0x05] = function (data) {
      var size = 9;
      if (data.blockId !== -1) {
          size += 6;
      };
      if (data.metaData || data.metaData.length !== -1) {
          size += data.metaData.length;
      }
      var packet = new Buffer(size);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x05);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeShort(data.slot);
      binaryWriter.writeSlot(data.item);

      return packet;
  };

  builders[0x06] = function (data) {
      var packet = new Buffer(13);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x06);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.y);
      binaryWriter.writeInt(data.z);

      return packet;
  };

  builders[0x08] = function (data) {
      var packet = new Buffer(9);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x08);
      binaryWriter.writeShort(data.health);
      binaryWriter.writeShort(data.food);
      binaryWriter.writeFloat(data.foodSaturation);

      return packet;
  };

  builders[0x0D] = function (data) {
      var packet = new Buffer(42);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x0D);
      binaryWriter.writeDouble(data.x);
      binaryWriter.writeDouble(data.stance);
      binaryWriter.writeDouble(data.y);
      binaryWriter.writeDouble(data.z);
      binaryWriter.writeFloat(data.yaw);
      binaryWriter.writeFloat(data.pitch);
      binaryWriter.writeBool(data.onGround);

      return packet;
  };

  builders[0x11] = function (data) {
      var packet = new Buffer(15);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x11);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeByte(0);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeByte(data.y);
      binaryWriter.writeInt(data.z);

      return packet;
  };

  builders[0x12] = function (data) {
      var packet = new Buffer(6);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x11);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeByte(data.animation);

      return packet;
  };

  builders[0x14] = function (data) {
      var packet = new Buffer(31 + data.playerName.length*2);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x14);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeString(data.playerName);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.y);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeByte(data.yaw);
      binaryWriter.writeByte(data.pitch);
      binaryWriter.writeShort(data.currentItem);
      binaryWriter.writeMetaData();
      return packet;
  };

  builders[0x15] = function (data) {
      var packet = new Buffer(25);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x15);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeShort(data.itemId);
      binaryWriter.writeByte(data.count);
      binaryWriter.writeShort(data.data);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.y);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeByte(data.rotation);
      binaryWriter.writeByte(data.pitch);
      binaryWriter.writeByte(data.roll);
      return packet;
  };

  builders[0x16] = function (data) {
      var packet = new Buffer(9);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x16);
      binaryWriter.writeInt(data.collectedId);
      binaryWriter.writeInt(data.collectorId);
      return packet;
  };

  builders[0x17] = function (data) {
      var packet = new Buffer(data.objectData > 0 ? 28 : 22);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x17);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeByte(data.type);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.y);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeInt(data.objectData);
      if (data.objectData > 0) {
          binaryWriter.writeShort(data.speedX);
          binaryWriter.writeShort(data.speedY);
          binaryWriter.writeShort(data.speedZ);
      }
      return packet;
  };

  builders[0x18] = function (data) {
      var packet = new Buffer(28);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x18);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeByte(data.type);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.y);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeByte(data.yaw);
      binaryWriter.writeByte(data.pitch);
      binaryWriter.writeByte(data.headYaw);
      binaryWriter.writeShort(data.velocityX);
      binaryWriter.writeShort(data.velocityY);
      binaryWriter.writeShort(data.velocityZ);
      binaryWriter.writeMetaData();
      return packet;
  };

  builders[0x19] = function (data) {
      var packet = new Buffer(23 + data.title.length*2);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x19);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeString(data.title);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.y);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeInt(data.direction);
      return packet;
  };

  builders[0x1A] = function (data) {
      var packet = new Buffer(19);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x1A);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.y);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeShort(data.count);
      return packet;
  };

  builders[0x1C] = function (data) {
      var packet = new Buffer(11);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x1C);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeShort(data.velocityX);
      binaryWriter.writeShort(data.velocityY);
      binaryWriter.writeShort(data.velocityZ);
      return packet;
  };

  builders[0x1D] = function (data) {
      var packet = new Buffer(2 + data.enityIds.length*4);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x1D);
      binaryWriter.writeByte(data.entityIds.length);
      for (var i = 0; i < data.entityIds.length; i++) {
          binaryWriter.writeInt(data.entityIds[i]);
      }
      return packet;
  };

  builders[0x1E] = function (data) {
      var packet = new Buffer(5);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x1E);
      binaryWriter.writeInt(data.entityId);
      return packet;
  };

  builders[0x1F] = function (data) {
      var packet = new Buffer(8);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x1F);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeSByte(data.dX);
      binaryWriter.writeSByte(data.dY);
      binaryWriter.writeSByte(data.dZ);
      return packet;
  };

  builders[0x20] = function (data) {
      var packet = new Buffer(7);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x20);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeByte(data.yaw);
      binaryWriter.writeByte(data.pitch);
      return packet;
  };

  builders[0x21] = function (data) {
      var packet = new Buffer(10);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x21);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeSByte(data.dX);
      binaryWriter.writeSByte(data.dY);
      binaryWriter.writeSByte(data.dZ);
      binaryWriter.writeByte(data.yaw);
      binaryWriter.writeByte(data.pitch);
      return packet;
  };

  builders[0x22] = function (data) {
      var packet = new Buffer(19);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x22);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.y);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeByte(data.yaw);
      binaryWriter.writeByte(data.pitch);
      return packet;
  };

  builders[0x23] = function (data) {
      var packet = new Buffer(6);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x23);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeByte(data.headYaw);
      return packet;
  };

  builders[0x26] = function (data) {
      var packet = new Buffer(6);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x23);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeByte(data.status);
      return packet;
  };

  builders[0x27] = function (data) {
      var packet = new Buffer(9);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x27);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeInt(data.vehicleId);
      return packet;
  };

  builders[0x28] = function (data) {
    //TODO: metadata
  };

  builders[0x29] = function (data) {
      var packet = new Buffer(9);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x29);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeByte(data.effectId);
      binaryWriter.writeByte(data.amplifier);
      binaryWriter.writeShort(data.duration);
      return packet;
  };

  builders[0x2A] = function (data) {
      var packet = new Buffer(9);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x2A);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeByte(data.effectId);
      return packet;
  };

  builders[0x2B] = function (data) {
      var packet = new Buffer(9);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x2B);
      binaryWriter.writeFloat(data.experienceBar);
      binaryWriter.writeShort(data.level);
      binaryWriter.writeShort(data.totalExperience);
      return packet;
  };

  builders[0x33] = function (data) {
      var packet = new Buffer(18 + data.compressedSize);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x33);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeBool(data.continuous);
      binaryWriter.writeUShort(data.primaryBitmap);
      binaryWriter.writeUShort(data.addBitmap);
      binaryWriter.writeInt(data.compressedSize);
      binaryWriter.writeArray(data.compressedData);
      return packet;
  };

  builders[0x34] = function (data) {
      var packet = new Buffer(15 + data.data.length*4);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x34);
      binaryWriter.writeInt(data.chunkX);
      binaryWriter.writeInt(data.chunkZ);
      binaryWriter.writeShort(data.data.length);
      binaryWriter.writeInt(data.data.length*4);
      for (var i = 0; i < data.data.length; i++) {
          binaryWriter.writeInt(data.data[i]);
      }
      return packet;
  };

  builders[0x35] = function (data) {
      var packet = new Buffer(13);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x35);
      binaryWriter.writeInt(data.X);
      binaryWriter.writeByte(data.Y);
      binaryWriter.writeInt(data.Z);
      binaryWriter.writeShort(data.blockType);
      binaryWriter.writeByte(data.blockMetadata);
      return packet;
  };

  builders[0x36] = function (data) {
      var packet = new Buffer(15);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x36);
      binaryWriter.writeInt(data.X);
      binaryWriter.writeShort(data.Y);
      binaryWriter.writeInt(data.Z);
      binaryWriter.writeByte(data.byte1);
      binaryWriter.writeByte(data.byte2);
      binaryWriter.writeShort(data.blockId);
      return packet;
  };

  builders[0x37] = function (data) {
      var packet = new Buffer(18);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x37);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.y);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeByte(data.stage);
      return packet;
  };

  builders[0x38] = function (data) {
      var packet = new Buffer(7 + data.chunkData.length + (12*data.metadata.length));
      var binaryWriter = new BinaryWriter(packet);
  
      binaryWriter.writeByte(0x38);
      binaryWriter.writeShort(data.chunkCount);
      binaryWriter.writeInt(data.chunkData.length);
      binaryWriter.writeArray(data.chunkData);
      for (var i = 0; i < data.metadata.length; i++) {
          binaryWriter.writeInt(data.metadata[i].chunkX);
          binaryWriter.writeInt(data.metadata[i].chunkZ);
          binaryWriter.writeUShort(data.metadata[i].primaryBitmap);
          binaryWriter.writeUShort(data.metadata[i].addBitmap);
      }

      return packet;
  };

  builders[0x3C] = function (data) {
  };

  builders[0x3D] = function (data) {
      var packet = new Buffer(18);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x3D);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeByte(data.y);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeByte(data.data);
      return packet;
  };

  builders[0x3E] = function (data) {
  };

  builders[0x46] = function (data) {
      var packet = new Buffer(3);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x46);
      binaryWriter.writeByte(data.reason);
      binaryWriter.writeByte(data.gameMode);
      return packet;
  };

  builders[0x47] = function (data) {
      var packet = new Buffer(18);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x47);
      binaryWriter.writeInt(data.entityId);
      binaryWriter.writeBool(true);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeInt(data.y);
      binaryWriter.writeInt(data.z);
      return packet;
  };

  builders[0x64] = function (data) {
  };

  builders[0x65] = function (data) {
      var packet = new Buffer(2);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x65);
      binaryWriter.writeByte(data.windowId);
      return packet;
  };

  builders[0x66] = function (data) {
  };

  builders[0x67] = function (data) {
  };

  builders[0x68] = function (data) {
  };

  builders[0x69] = function (data) {
      var packet = new Buffer(6);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x69);
      binaryWriter.writeByte(data.windowId);
      binaryWriter.writeShort(data.property);
      binaryWriter.writeShort(data.value);
      return packet;
  };

  builders[0x6A] = function (data) {
      var packet = new Buffer(6);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x6A);
      binaryWriter.writeByte(data.windowId);
      binaryWriter.writeShort(data.actionNumber);
      binaryWriter.writeBool(data.accepted);
      return packet;
  };

  builders[0x6C] = function (data) {
      var packet = new Buffer(3);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x6C);
      binaryWriter.writeByte(data.windowId);
      binaryWriter.writeByte(data.enchantment);
      return packet;
  };

  builders[0x82] = function (data) {
      var packet = new Buffer(19 + data.text1.length*2 + data.text2.length*2 + data.text3.length*2 + data.text4.length*2);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0x82);
      binaryWriter.writeInt(data.x);
      binaryWriter.writeShort(data.y);
      binaryWriter.writeInt(data.z);
      binaryWriter.writeString(data.text1);
      binaryWriter.writeString(data.text2);
      binaryWriter.writeString(data.text3);
      binaryWriter.writeString(data.text4);
      return packet;
  };

  builders[0x83] = function (data) {
  };

  builders[0x84] = function (data) {
  };

  builders[0xC8] = function (data) {
      var packet = new Buffer(6);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0xC8);
      binaryWriter.writeInt(data.statistic);
      binaryWriter.writeBool(data.amount);
      return packet;
  };

  builders[0xC9] = function (data) {
      var packet = new Buffer(6 + data.playerName.length *2);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0xC9);
      binaryWriter.writeString(data.playerName);
      binaryWriter.writeBool(data.online);
      binaryWriter.writeShort(data.ping);
      return packet;
  };

  builders[0xCA] = function (data) {
      var packet = new Buffer(4);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0xCA);
      binaryWriter.writeByte(data.flags);
      binaryWriter.writeByte(data.flyingSpeed);
      binaryWriter.writeByte(data.walkingSpeed);
      return packet;
  };

  builders[0xCB] = function (data) {
  };

  builders[0xFA] = function (data) {
      var packet = new Buffer(5 + (data.channel.length*2) + data.dataLength);
      var binaryWriter = new BinaryWriter(packet);

      binaryWriter.writeByte(0xFA);
      binaryWriter.writeString(data.channel);
      binaryWriter.writeShort(data.dataLength);
      binaryWriter.writeArray(data.data);
      return packet;
  };

  builders[0xFC] = function (data) {
      //TODO: Encryption
  };

  builders[0xFD] = function (data) {
      //TODO: Encryption
  };
    
  builders[0xFF] = function (data) {
    var packet = new Buffer(3 + data.serverStatus.length*2);
    var binaryWriter = new BinaryWriter(packet);

    binaryWriter.writeByte(0xFF);
    binaryWriter.writeString(data.serverStatus);

    return packet;
  };
  
  self.build = function(type, data) {
    if( !builders.hasOwnProperty(type)) {
      console.log('Unknown packet to build: ' + type);
      return new Buffer(0);
    }
    
    return builders[type](data);
  };
};

module.exports = PacketWriter;