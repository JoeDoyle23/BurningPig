var varint = require('varint'),
    Packet = require('./packet.js'),
    packets = require('./packetList').serverPackets;
    statusPackets = require('./packetList').serverStatusPackets;
    loginPackets = require('./packetList').serverLoginPackets;

var PacketWriter = function() {
    var self = this;

    var builders = {};
    var statusBuilders = {};
    var loginBuilders = {};

    builders[packets.KeepAlive] = function (data) {
        var packet = new Packet(5);

        packet.writeByte(packets.KeepAlive)
            .writeInt(data.keepAliveId);

        return packet;
    };

    builders[packets.JoinGame] = function (data) {
        var packet = new Packet(17);
 
        packet.writeByte(packets.JoinGame)
            .writeInt(data.entityId)
            .writeByte(data.gameMode)
            .writeByte(data.dimension)
            .writeByte(data.difficulty)
            .writeByte(data.maxPlayers)
            .writeString("default");

        return packet;
    };

    builders[packets.ChatMessage] = function (data) {
        var packet = new Packet(1 + strLen(data.message));

        packet.writeByte(packets.ChatMessage)
            .writeString(data.message);

        return packet;
    };

    builders[packets.TimeUpdate] = function (data) {
        var packet = new Packet(17);

        packet.writeByte(packets.TimeUpdate)
            .writeArray(data.worldAge)
            .writeArray(data.time);

        return packet;
    };

    builders[packets.EntityEquipment] = function (data) {
        var packet = new Packet(7 + slotLen(data.item));

        packet.writeByte(packets.EntityEquipment)
            .writeInt(data.entityId)
            .writeShort(data.slot)
            .writeSlot(data.item)

        return packet;
    };

    builders[packets.SpawnPosition] = function (data) {
        var packet = new Packet(13);

        packet.writeByte(packets.SpawnPosition)
            .writeInt(data.x)
            .writeInt(data.y)
            .writeInt(data.z);

        return packet;
    };

    builders[packets.UpdateHealth] = function (data) {
        var packet = new Packet(11);

        packet.writeByte(packets.UpdateHealth)
            .writeFloat(data.health)
            .writeShort(data.food)
            .writeFloat(data.foodSaturation);

        return packet;
    };

    builders[packets.Respawn] = function(data) {
        var packet = new Packet(15);
        
        packet.writeByte(packets.Respawn)
            .writeInt(data.dimension)
            .writeByte(data.difficulty)
            .writeByte(data.gameMode)
            .writeString("default");

        return packet;
    };

    builders[packets.PlayerPositionAndLook] = function (data) {
        var packet = new Packet(34);

        packet.writeByte(packets.PlayerPositionAndLook)
            .writeDouble(data.x)
            .writeDouble(data.y)
            .writeDouble(data.z)
            .writeFloat(data.yaw)
            .writeFloat(data.pitch)
            .writeBool(data.onGround);

        return packet;
    };

    builders[packets.HeldItemChange] = function (data) {
        var packet = new Packet(2);

        packet.writeByte(packets.HeldItemChange)
            .writeByte(data.slotId);

        return packet;
    };

    builders[packets.UseBed] = function (data) {
        var packet = new Packet(14);

        packet.writeByte(packets.UseBed)
            .writeInt(data.entityId)
            .writeInt(data.x)
            .writeByte(data.y)
            .writeInt(data.z);

        return packet;
    };

    builders[packets.Animation] = function (data) {
        var entityId = varint.encode(data.entityId);
        var packet = new Packet(2 + entityId.length);

        packet.writeByte(packets.Animation)
            .writeVarint(entityId)
            .writeByte(data.animation);

        return packet;
    };

    builders[packets.SpawnPlayer] = function (data) {
        var entityId = varint.encode(data.entityId);
        var packet = new Packet(17 + entityId.length + strLen(data.playerName) + strLen(data.playerUUID) + metaLen(data.metadata));

        packet.writeByte(packets.SpawnPlayer)
            .writeVarint(data.entityId)
            .writeString(data.playerUUID)
            .writeString(data.playerName)
            .writeInt(data.x)
            .writeInt(data.y)
            .writeInt(data.z)
            .writeByte(data.yaw)
            .writeByte(data.pitch)
            .writeShort(data.currentItem)
            .writeMetadata(data.metadata);

        return packet;
    };

    builders[packets.CollectItem] = function (data) {
        var packet = new Packet(9);

        packet.writeByte(packets.CollectItem)
            .writeInt(data.collectedId)
            .writeInt(data.collectorId);

        return packet;
    };

    builders[packets.SpawnObject] = function (data) {
        var entityId = varint.encode(data.entityId);
        var packet = new Packet(entityId.length + 20);

        packet.writeByte(packets.SpawnObject)
            .writeVarint(entityId)
            .writeByte(data.type)
            .writeInt(data.x)
            .writeInt(data.y)
            .writeInt(data.z)
            .writeByte(data.yaw)
            .writeByte(data.pitch)
            .writeInt(data.objectData);
        if (data.objectData > 0) {
            packet.writeShort(data.speedX)
                .writeShort(data.speedY)
                .writeShort(data.speedZ);
        }
        return packet;
    };

    builders[packets.SpawnMob] = function (data) {
        var entityId = varint.encode(data.entityId);
        var packet = new Packet(entityId.length + 24);

        packet.writeByte(packets.SpawnMob)
            .writeVarint(entityId)
            .writeByte(data.type)
            .writeInt(data.x)
            .writeInt(data.y)
            .writeInt(data.z)
            .writeByte(data.pitch)
            .writeByte(data.headPitch)
            .writeByte(data.yaw)
            .writeShort(data.velocityX)
            .writeShort(data.velocityY)
            .writeShort(data.velocityZ)
            .writeMetadata();
        return packet;
    };

    builders[packets.SpawnPainting] = function (data) {
        var entityId = varint.encode(data.entityId);
        var packet = new Packet(17 + entityId.length + strLen(data.title));

        packet.writeByte(packets.SpawnPainting)
            .writeVarint(entityId)
            .writeString(data.title)
            .writeInt(data.x)
            .writeInt(data.y)
            .writeInt(data.z)
            .writeInt(data.direction);
        return packet;
    };

    builders[packets.SpawnExperienceOrb] = function (data) {
        var entityId = varint.encode(data.entityId);
        var packet = new Packet(15 + entityId.length);

        packet.writeByte(packets.SpawnExperienceOrb)
            .writeVarint(entityId)
            .writeInt(data.x)
            .writeInt(data.y)
            .writeInt(data.z)
            .writeShort(data.count);
        return packet;
    };

    builders[packets.EntityVelocity] = function (data) {
        var packet = new Packet(11);

        packet.writeByte(packets.EntityVelocity)
            .writeInt(data.entityId)
            .writeShort(data.velocityX)
            .writeShort(data.velocityY)
            .writeShort(data.velocityZ);
        return packet;
    };

    builders[packets.DestroyEntities] = function (data) {
        var packet = new Packet(2 + data.entityIds.length * 4);

        console.log(data.entityIds.length);

        packet.writeByte(packets.DestroyEntities)
            .writeByte(data.entityIds.length);

        for (var i = 0; i < data.entityIds.length; i++) {
            packet.writeInt(data.entityIds[i]);
        }
        return packet;
    };

    builders[packets.Entity] = function (data) {
        var packet = new Packet(5);

        packet.writeByte(packets.Entity)
            .writeInt(data.entityId);
        return packet;
    };

    builders[packets.EntityRelativeMove] = function (data) {
        var packet = new Packet(8);

        packet.writeByte(packets.EntityRelativeMove)
            .writeInt(data.entityId)
            .writeSByte(data.dX)
            .writeSByte(data.dY)
            .writeSByte(data.dZ);
        return packet;
    };

    builders[packets.EntityLook] = function (data) {
        var packet = new Packet(7);

        packet.writeByte(packets.EntityLook)
            .writeInt(data.entityId)
            .writeByte(data.yaw)
            .writeByte(data.pitch);
        return packet;
    };

    builders[packets.EntityLookAndRelativeMove] = function (data) {
        var packet = new Packet(10);

        packet.writeByte(packets.EntityLookAndRelativeMove)
            .writeInt(data.entityId)
            .writeSByte(data.dX)
            .writeSByte(data.dY)
            .writeSByte(data.dZ)
            .writeByte(data.yaw)
            .writeByte(data.pitch);
        return packet;
    };

    builders[packets.EntityTeleport] = function (data) {
        var packet = new Packet(19);

        packet.writeByte(packets.EntityTeleport)
            .writeInt(data.entityId)
            .writeInt(data.x)
            .writeInt(data.y)
            .writeInt(data.z)
            .writeByte(data.yaw)
            .writeByte(data.pitch);
        return packet;
    };

    builders[packets.EntityHeadLook] = function (data) {
        var packet = new Packet(6);

        packet.writeByte(packets.EntityHeadLook)
            .writeInt(data.entityId)
            .writeByte(data.headYaw);
        return packet;
    };

    builders[packets.EntityStatus] = function (data) {
        var packet = new Packet(6);

        packet.writeByte(packets.EntityStatus)
            .writeInt(data.entityId)
            .writeByte(data.status);
        return packet;
    };

    builders[packets.AttachEntity] = function (data) {
        var packet = new Packet(10);

        packet.writeByte(packets.AttachEntity)
            .writeInt(data.entityId)
            .writeInt(data.vehicleId)
            .writeBool(data.leash);

        return packet;
    };

    builders[packets.EntityMetadata] = function (data) {
        var packet = new Packet(5 + metaLen(data.metadata));

        packet.writeByte(packets.EntityMetadata)
            .writeInt(data.entityId)
            .writeMetadata(data.metadata);

        return packet;
    };

    builders[packets.EntityEffect] = function (data) {
        var packet = new Packet(9);

        packet.writeByte(packets.EntityEffect)
            .writeInt(data.entityId)
            .writeByte(data.effectId)
            .writeByte(data.amplifier)
            .writeShort(data.duration);
        return packet;
    };

    builders[packets.RemoveEntityEffect] = function (data) {
        var packet = new Packet(9);

        packet.writeByte(packets.RemoveEntityEffect)
            .writeInt(data.entityId)
            .writeByte(data.effectId);
        return packet;
    };

    builders[packets.SetExperience] = function (data) {
        var packet = Packet(9);

        packet.writeByte(packets.SetExperience)
            .writeFloat(data.experienceBar)
            .writeShort(data.level)
            .writeShort(data.totalExperience);
        return packet;
    };

    builders[packets.EntityProperties] = function (data) {
        var packet = Packet(19 + strLen(data.key));

        packet.writeByte(packets.EntityProperties)
            .writeInt(data.entityId)
            .writeInt(1) //TODO: Impliment sending mutliple Properties
            .writeString(data.key)
            .writeDouble(data.value)
            .writeShort(0);

        return packet;
    };

    builders[packets.ChunkData] = function (data) {
        var packet = new Packet(18 + data.compressedSize);

        packet.writeByte(packets.ChunkData)
            .writeInt(data.x)
            .writeInt(data.z)
            .writeBool(data.continuous)
            .writeUShort(data.primaryBitmap)
            .writeUShort(data.addBitmap)
            .writeInt(data.compressedSize)
            .writeArray(data.compressedData);
        return packet;
    };

    builders[packets.MultiBlockChange] = function (data) {
        var packet = new Packet(15 + data.data.length * 4);

        packet.writeByte(packets.MultiBlockChange)
            .writeInt(data.chunkX)
            .writeInt(data.chunkZ)
            .writeShort(data.data.length)
            .writeInt(data.data.length * 4);

        for (var i = 0; i < data.data.length; i++) {
            packet.writeInt(data.data[i]);
        }
        return packet;
    };

    builders[packets.BlockChange] = function (data) {
        var blockType = varint.encode(data.blockType);
        var packet = new Packet(11 + blockType.length);

        packet.writeByte(packets.BlockChange)
            .writeInt(data.x)
            .writeByte(data.y)
            .writeInt(data.z)
            .writeVarint(blockType)
            .writeByte(data.blockMetadata);
        return packet;
    };

    builders[packets.BlockAction] = function (data) {
        var blockType = varint.encode(data.blockType);
        var packet = new Packet(13 + blockType.length);

        packet.writeByte(packets.BlockAction)
            .writeInt(data.X)
            .writeShort(data.Y)
            .writeInt(data.Z)
            .writeByte(data.byte1)
            .writeByte(data.byte2)
            .writeVarint(blockType);
        return packet;
    };

    builders[packets.BlockBreakAnimation] = function (data) {
        var entityId = varint.encode(data.entityId);
        var packet = new Packet(14 + entityId);

        packet.writeByte(packets.BlockBreakAnimation)
            .writeVarint(entityId)
            .writeInt(data.x)
            .writeInt(data.y)
            .writeInt(data.z)
            .writeByte(data.stage);
        return packet;
    };

    builders[packets.MapChunkBulk] = function (data) {
        var packet = new Packet(8 + data.chunkData.length + (12 * data.metadata.length));

        packet.writeByte(packets.MapChunkBulk)
            .writeShort(data.chunkCount)
            .writeInt(data.chunkData.length)
            .writeBool(true) //TODO: Handle SkyLightSent flag
            .writeArray(data.chunkData);

        for (var i = 0; i < data.metadata.length; i++) {
            packet.writeInt(data.metadata[i].chunkX)
                .writeInt(data.metadata[i].chunkZ)
                .writeUShort(data.metadata[i].primaryBitmap)
                .writeUShort(data.metadata[i].addBitmap);
        }

        return packet;
    };

    builders[packets.Explosion] = function (data) {
        var packet = new Packet(33);

        packet.writeByte(packets.Explosion)
            .writeFloat(data.x)
            .writeFloat(data.y)
            .writeFloat(data.z)
            .writeFloat(data.radius)
            .writeInt(0) //TODO: Add explosion data
            .writeFloat(0)
            .writeFloat(0)
            .writeFloat(0);
        return packet;
    };

    builders[packets.Effect] = function (data) {
        var packet = new Packet(18);

        packet.writeByte(packets.Effect)
            .writeInt(data.entityId)
            .writeInt(data.x)
            .writeByte(data.y)
            .writeInt(data.z)
            .writeByte(data.data)
            .writeBool(false);
        return packet;
    };

    builders[packets.SoundEffect] = function (data) {
        var packet = new Packet(18 + strLen(data.soundName));

        packet.writeByte(packets.SoundEffect)
            .writeString(data.soundName)
            .writeInt(data.x)
            .writeInt(data.y)
            .writeInt(data.z)
            .writeFloat(data.volume)
            .writeByte(data.pitch);

        return packet;
    };

    builders[packets.Particle] = function (data) {
        var packet = new Packet(32 + strLen(data.particleName));

        packet.writeByte(packets.Particle)
            .writeString(data.particleName)
            .writeFloat(data.x)
            .writeFloat(data.y)
            .writeFloat(data.z)
            .writeFloat(data.offsetX)
            .writeFloat(data.offsetY)
            .writeFloat(data.offsetZ)
            .writeFloat(data.paticleSpeed)
            .writeInt(data.particleCount);

        return packet;
    };

    builders[packets.ChangeGameState] = function (data) {
        var packet = new Packet(6);

        packet.writeByte(packets.ChangeGameState)
            .writeByte(data.reason)
            .writeFloat(data.value);
        return packet;
    };

    builders[packets.SpawnGlobalEntity] = function (data) {
        var entityId = varint.encode(data.entityId);
        var packet = new Packet(14 + entityId.length);

        packet.writeByte(packets.SpawnGlobalEntity)
            .writeVarint(entityId)
            .writeByte(data.type)
            .writeInt(data.x)
            .writeInt(data.y)
            .writeInt(data.z);
        return packet;
    };

    builders[packets.OpenWindow] = function (data) {
        var packet = new Packet(6 + strLen(data.windowTitle));

        packet.writeByte(0x64)
            .writeByte(data.windowId)
            .writeByte(data.inventoryType)
            .writeString(data.windowTitle)
            .writeByte(data.slotCount)
            .writeBool(data.useCustomTitle)
            .writeInt(data.entityId);

        return packet;
    };

    builders[packets.CloseWindow] = function (data) {
        var packet = new Packet(2);

        packet.writeByte(packets.CloseWindow)
            .writeByte(data.windowId);

        return packet;
    };

    builders[packets.SetSlot] = function (data) {
        var packet = new Packet(4 + slotLen(data.slot));

        packet.writeByte(packets.SetSlot)
            .writeByte(data.windowId)
            .writeShort(data.slotId)
            .writeSlot(data.slot);

        return packet;
    };

    builders[packets.WindowItems] = function (data) {
        var packet = new Packet(6 + slotLen(data.entity));

        packet.writeByte(packets.WindowItems)
            .writeByte(data.windowId)
            .writeShort(1) //TODO: send all items at once
            .writeSlot(data.entity);
        return packet;
    };

    builders[packets.WindowProperty] = function (data) {
        var packet = new Packet(6);

        packet.writeByte(packets.WindowProperty)
            .writeByte(data.windowId)
            .writeShort(data.property)
            .writeShort(data.value);
        return packet;
    };

    builders[packets.ConfirmTransaction] = function (data) {
        var packet = new Packet(6);

        packet.writeByte(packets.ConfirmTransaction)
            .writeByte(data.windowId)
            .writeShort(data.actionNumber)
            .writeBool(data.accepted);
        return packet;
    };

    builders[packets.UpdateSign] = function (data) {
        var packet = new Packet(11 + strLen(data.text1) + strLen(data.text2) + strLen(data.text3) + strLen(data.text4));

        packet.writeByte(packets.UpdateSign)
            .writeInt(data.x)
            .writeShort(data.y)
            .writeInt(data.z)
            .writeString(data.text1)
            .writeString(data.text2)
            .writeString(data.text3)
            .writeString(data.text4);
        return packet;
    };

    builders[packets.Maps] = function (data) {
        var itemDamage = varint.encode(data.itemDamage);
        var packet = new Packet(3 + itemDamage.length + data.data.length);

        packet.writeByte(packets.Maps)
            .writeVarint(itemDamage)
            .writeShort(data.data.length)
            .writeArray(data.data);

        return packet;
    };

    builders[packets.UpdateBlockEntity] = function (data) {
        var packet = new Packet(14 + data.data.length);

        packet.writeByte(packets.UpdateBlockEntity)
            .writeInt(data.x)
            .writeShort(data.y)
            .writeInt(data.z)
            .writeByte(data.action)
            .writeShort(data.data.length)
            .writeArray(data.data);

        return packet;
    };


    builders[packets.Statistics] = function (data) {
        var count = varint.encode(data.statistics.length);
        var packet = new Packet(1 + count.length + data.statistics.length * 8);

        packet.writeByte(packets.Statistics)
            .writeVarint(count);

            //TODO: handle converting this to varint
        for (var i = 0; i < data.statistics.length; i++) {
            packet.writeInt(data.statistics[i].statistic)
                .writeInt(data.statistics[i].amount);
        }

        return packet;
    };

    builders[packets.PlayerListItem] = function (data) {
        var packet = new Packet(4 + strLen(data.playerName));

        packet.writeByte(packets.PlayerListItem)
            .writeString(data.playerName)
            .writeBool(data.online)
            .writeShort(data.ping);
        return packet;
    };

    builders[packets.PlayerAbilities] = function (data) {
        var packet = new Packet(10);

        packet.writeByte(packets.PlayerAbilities)
            .writeByte(data.flags)
            .writeFloat(data.flyingSpeed)
            .writeFloat(data.walkingSpeed);
        return packet;
    };

    builders[packets.TabComplete] = function (data) {
        var count = varint.encode(data.matches.length);
        var packet = new Packet(1 + strLen(data.matches[0]));

        //TODO: handle sending multiple tab completion responses
        packet.writeByte(packets.TabComplete)
            .writeVarint(count)
            .writeString(data.matches[0]);

        return packet;
    };

    builders[packets.ScoreboardObjective] = function (data) {
        var packet = new Packet(2 + strLen(data.objectiveName) + strLen(data.objectiveValue));

        packet.writeByte(packets.ScoreboardObjective)
            .writeString(data.objectiveName)
            .writeString(data.objectiveValue)
            .writeByte(data.action);

        return packet;
    };

    builders[packets.UpdateScore] = function (data) {
        var packet = new Packet(6 + strLen(data.itemName) + strLen(data.scoreName));

        packet.writeByte(packets.UpdateScore)
            .writeString(data.itemName)
            .writeByte(data.action)
            .writeString(data.scoreName)
            .writeInt(data.value);

        return packet;
    };

    builders[packets.DisplayScoreboard] = function (data) {
        var packet = new Packet(2 + strLen(data.scoreName));

        packet.writeByte(packets.DisplayScoreboard)
            .writeByte(data.position)
            .writeString(data.scoreName);

        return packet;
    };

    builders[packets.Teams] = function (data) {
        var packet = new Packet(2 + strLen(data.scoreName));

        //TODO: handle teams    

        return packet;
    
    };

    builders[packets.PluginMessage] = function (data) {
        var packet = new Packet(3 + strLen(data.channel) + data.data.length);

        packet.writeByte(packets.PluginMessage)
            .writeString(data.channel)
            .writeShort(data.data.length)
            .writeArray(data.data);
        return packet;
    };

    builders[packets.Disconnect] = function (data) {
        var packet = new Packet(1+ strLen(data.reason));

        packet.writeByte(packets.Disconnect)
            .writeString(data.reason);

        return packet;
    };

    statusBuilders[statusPackets.Response] = function (data) {
        var packet = new Packet(1 + strLen(data.response));

        packet.writeVarint(varint.encode(statusPackets.Response))
            .writeString(data.response);

        return packet;
    };

    statusBuilders[statusPackets.Ping] = function (data) {
        var packet = new Packet(9);

        packet.writeVarint(varint.encode(statusPackets.Ping))
            .writeArray(data.time);

        return packet;
    };

    loginBuilders[loginPackets.Disconnect] = function (data) {
        var packet = new Packet(1 + strLen(data.message));

        packet.writeVarint(varint.encode(loginPackets.Disconnect))
            .writeString(data.message);

        return packet;
    };

    loginBuilders[loginPackets.EncryptionRequest] = function (data) {
        var packet = new Packet(5 + strLen(data.serverId) + data.publicKey.length + data.token.length);

        packet.writeVarint(varint.encode(loginPackets.EncryptionRequest))
            .writeString(data.serverId)
            .writeShort(data.publicKey.length)
            .writeArray(data.publicKey)
            .writeShort(data.token.length)
            .writeArray(data.token);
        return packet;
    };

    loginBuilders[loginPackets.LoginSuccess] = function (data) {
        var packet = new Packet(1 + strLen(data.uuid) + strLen(data.username));

        packet.writeVarint(varint.encode(loginPackets.LoginSuccess))
            .writeString(data.uuid)
            .writeString(data.username);

        return packet;
    };

    self.build = function(data) {
        if(data.ptype!==3)
            console.log("Building game packet: " + data.ptype.toString(16));

        if (!builders.hasOwnProperty(data.ptype)) {
            console.log('Unknown packet to build: ' + data.ptype);
            console.log(data);
            return new Buffer(0);
        }

        return builders[data.ptype](data).result();
    };

    self.buildStatus = function(data) {
        console.log("Building status packet: " + data.ptype.toString(16));

        if (!statusBuilders.hasOwnProperty(data.ptype)) {
            console.log('Unknown status packet to build: ' + data.ptype);
            console.log(data);
            return new Buffer(0);
        }

        return statusBuilders[data.ptype](data).result();
    };

    self.buildLogin = function(data) {
        console.log("Building login packet: " + data.ptype.toString(16));

        if (!loginBuilders.hasOwnProperty(data.ptype)) {
            console.log('Unknown login packet to build: ' + data.ptype);
            console.log(data);
            return new Buffer(0);
        }

        return loginBuilders[data.ptype](data).result();
    };
};

function strLen(str) {
    return str.length + varint.encode(str.length).length;
};

function slotLen(data) {
    if (data.itemId === -1)
        return 2;

    return data.nbtlength === -1 ? 7 : 7 + data.nbtlength;
};

function metaLen(data) {
    if (data.length === 0) {
        return 3;
    }

    var size = 0;
    for (var i = 0, j = data.length; i < j; i++) {
        size++;
        switch (data[i].type) {
            case 0:
                size++;
                break;
            case 1:
                size += 2;
                break;
            case 2:
            case 3:
                size += 4;
                break;
            case 4:
                size += (2 + strLen(data[i].data));
                break;
            case 5:
                size += slotLen(data[i].data);
                break;
        };
    }

    size++;
    return size;
};

module.exports = PacketWriter;