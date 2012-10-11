var BinaryReader = require('../util/binaryReader'),
    util = require('util');

var PacketReader = function () {
    var self = this;

    var parsers = [];

    parsers[0x00] = function (binaryReader) {
        //console.log('Got keepalive'.cyan);

        var data = {
            type: binaryReader.readByte(),
            keepAliveId: binaryReader.readInt()
        };

        return data;
    };

    parsers[0x02] = function (binaryReader) {
        //console.log('Got handshake'.cyan);

        var data = {
            type: binaryReader.readByte(),
            protocol: binaryReader.readByte(),
            username: binaryReader.readString(),
            server: binaryReader.readString(),
            serverPort: binaryReader.readInt()
        };

        return data;
    };

    parsers[0x03] = function (binaryReader) {
        //console.log('Got chat message'.cyan);

        var data = {
            type: binaryReader.readByte(),
            message: binaryReader.readString()
        };

        return data;
    };

    parsers[0x07] = function (binaryReader) {
        //console.log('Got use entity'.cyan);

        var data = {
            type: binaryReader.readByte(),
            user: binaryReader.readInt(),
            target: binaryReader.readInt(),
            mouseButton: binaryReader.readBool()
        };

        return data;
    };

    parsers[0x0A] = function (binaryReader) {
        //console.log('Got Player Status'.cyan);

        var data = {
            type: binaryReader.readByte(),
            onGround: binaryReader.readBool(),
        };

        return data;
    };

    parsers[0x0B] = function (binaryReader) {
        //console.log('Got Player Position'.cyan);

        var data = {
            type: binaryReader.readByte(),
            x: binaryReader.readDouble(),
            y: binaryReader.readDouble(),
            stance: binaryReader.readDouble(),
            z: binaryReader.readDouble(),
            onGround: binaryReader.readBool(),
        };

        return data;
    };

    parsers[0x0C] = function (binaryReader) {
        //console.log('Got Player Look');

        var data = {
            type: binaryReader.readByte(),
            yaw: binaryReader.readFloat(),
            pitch: binaryReader.readFloat(),
            onGround: binaryReader.readBool(),
        };

        return data;
    };

    parsers[0x0D] = function (binaryReader) {
        //console.log('Got Player Position & Look'.cyan);

        var data = {
            type: binaryReader.readByte(),
            x: binaryReader.readDouble(),
            y: binaryReader.readDouble(),
            stance: binaryReader.readDouble(),
            z: binaryReader.readDouble(),
            yaw: binaryReader.readFloat(),
            pitch: binaryReader.readFloat(),
            onGround: binaryReader.readBool(),
        };

        return data;
    };

    parsers[0x0E] = function (binaryReader) {
        //console.log('Got Player Digging');

        var data = {
            type: binaryReader.readByte(),
            status: binaryReader.readByte(),
            x: binaryReader.readInt(),
            y: binaryReader.readByte(),
            z: binaryReader.readInt(),
            face: binaryReader.readByte(),
        };

        return data;
    };

    parsers[0x0F] = function (binaryReader) {
        //console.log('Got Player Block Placement');

        var data = {
            type: binaryReader.readByte(),
            x: binaryReader.readInt(),
            y: binaryReader.readByte(),
            z: binaryReader.readInt(),
            direction: binaryReader.readByte(),
            heldItem: binaryReader.readSlot(),
            cursorX: binaryReader.readByte(),
            cursorY: binaryReader.readByte(),
            cursorZ: binaryReader.readByte(),
        };

        return data;
    };

    parsers[0x10] = function (binaryReader) {
        //console.log('Got Player Held Item Changed');

        var data = {
            type: binaryReader.readByte(),
            slotId: binaryReader.readShort(),
        };

        return data;
    };

    parsers[0x12] = function (binaryReader) {
        //console.log('Got Animation');

        var data = {
            type: binaryReader.readByte(),
            entityId: binaryReader.readInt(),
            animation: binaryReader.readByte(),
        };

        return data;
    };

    parsers[0x13] = function (binaryReader) {
        //console.log('Got Entity Action');

        var data = {
            type: binaryReader.readByte(),
            entityId: binaryReader.readInt(),
            action: binaryReader.readByte(),
        };

        return data;
    };

    parsers[0x65] = function (binaryReader) {
        //console.log('Got Close Window');

        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
        };

        return data;
    };

    parsers[0x66] = function (binaryReader) {
        //console.log('Got Click Window');

        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            slot: binaryReader.readShort(),
            rightClick: binaryReader.readBool(),
            actionNumber: binaryReader.readShort(),
            shift: binaryReader.readBool(),
            clickedItem: binaryReader.readSlot(),
        };

        return data;
    };

    parsers[0x6A] = function (binaryReader) {
        console.log('Got Confirm Transaction');

        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            actionNumber: binaryReader.readShort(),
            accepted: binaryReader.readBool(),
        };

        return data;
    };

    parsers[0x6B] = function (binaryReader) {
        console.log('Got Create Inventory Action');

        var data = {
            type: binaryReader.readByte(),
            slot: binaryReader.readShort(),
            clickedItem: binaryReader.readSlot(),
        };

        return data;
    };

    parsers[0x6C] = function (binaryReader) {
        console.log('Got Enchant Item');

        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            enchantment: binaryReader.readByte(),
        };

        return data;
    };

    parsers[0x82] = function (binaryReader) {
        console.log('Got Update Sign');

        var data = {
            type: binaryReader.readByte(),
            x: binaryReader.readInt(),
            y: binaryReader.readByte(),
            z: binaryReader.readInt(),
            text1: binaryReader.readString(),
            text2: binaryReader.readString(),
            text3: binaryReader.readString(),
            text4: binaryReader.readString(),
        };

        return data;
    };

    parsers[0xCA] = function (binaryReader) {
        console.log('Got Player Abilities');

        var data = {
            type: binaryReader.readByte(),
            flags: binaryReader.readByte(),
            flyingSpeed: binaryReader.readByte(),
            walkingSpeed: binaryReader.readByte(),
        };

        return data;
    };

    parsers[0xCB] = function (binaryReader) {
        console.log('Got Tab Complete');

        var data = {
            type: binaryReader.readByte(),
            text: binaryReader.readString(),
        };

        return data;
    };

    parsers[0xCC] = function (binaryReader) {
        console.log('Got Locale and View Distance'.cyan);

        var data = {
            type: binaryReader.readByte(),
            locale: binaryReader.readString(),
            viewDistance: binaryReader.readByte(),
            chatFlags: binaryReader.readByte(),
            difficulty: binaryReader.readByte(),
            showCape: binaryReader.readBool()
        };

        return data;
    };

    parsers[0xCD] = function (binaryReader) {
        //console.log('Got Client Statuses'.cyan);

        var data = {
            type: binaryReader.readByte(),
            payload: binaryReader.readByte(),
        };

        return data;
    };

    parsers[0xFA] = function (binaryReader) {
        console.log('Got Plugin Message');

        var data = {
            type: binaryReader.readByte(),
            channel: binaryReader.readString(),
            length: binaryReader.readShort(),
            data: binaryReader.readArray(),
        };

        return data;
    };

    parsers[0xFC] = function (binaryReader) {
        //console.log('Got Encryption Key Response');

        var data = {
            type: binaryReader.readByte(),
            sharedSecretLength: binaryReader.readShort(),
        };

        data.sharedSecret = binaryReader.readArray(data.sharedSecretLength);
        data.tokenLength = binaryReader.readShort();
        data.token = binaryReader.readArray(data.tokenLength);

        return data;
    };

    parsers[0xFE] = function (binaryReader) {
        console.log('Got Server Ping Packet!'.cyan);
        return { type: binaryReader.readByte() };
    };

    parsers[0xFF] = function (binaryReader) {
        console.log('Got Disconnect/Kick'.cyan);

        var data = {
            reason: binaryReader.readString(),
        };

        return data;
    };

    self.parse = function (inputBuffer) {
        var type = inputBuffer[0];
        if (!parsers.hasOwnProperty(type)) {
            return { data: {}, error: util.format('unknown type: %s'.red, type.toString(16)) };
        }

        var binaryReader = new BinaryReader(inputBuffer);
        var packet = parsers[type](binaryReader);
        self.bufferUsed = binaryReader.getPosition();
        return packet;
    };
    
    self.bufferUsed = 0;
};

module.exports = PacketReader;