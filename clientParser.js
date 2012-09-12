var BinaryReader = require('./beConverters').BinaryReader,
    util = require('util');

var clientParser = function () {
    var self = this;

    var parsers = [];

    parsers[0x00] = function (binaryReader) {
        console.log('Got keepalive');

        var data = {
            type: binaryReader.readByte(),
            keepAliveId: binaryReader.readInt()
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };

    };

    parsers[0x02] = function (binaryReader) {
        console.log('Got handshake');

        var data = {
            type: binaryReader.readByte(),
            protocol: binaryReader.readByte(),
            username: binaryReader.readString(),
            server: binaryReader.readString(),
            serverPort: binaryReader.readInt()
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x03] = function (binaryReader) {
        console.log('Got chat message');

        var data = {
            type: binaryReader.readByte(),
            message: binaryReader.readString()
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x07] = function (binaryReader) {
        console.log('Got use entity');

        var data = {
            type: binaryReader.readByte(),
            user: binaryReader.readInt(),
            target: binaryReader.readInt(),
            mouseButton: binaryReader.readBool()
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x0A] = function (binaryReader) {
        console.log('Got Player Status');

        var data = {
            type: binaryReader.readByte(),
            onGround: binaryReader.readBool(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x0B] = function (binaryReader) {
        console.log('Got Player Position');

        var data = {
            type: binaryReader.readByte(),
            x: binaryReader.readDouble(),
            y: binaryReader.readDouble(),
            stance: binaryReader.readDouble(),
            z: binaryReader.readDouble(),
            onGround: binaryReader.readBool(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x0C] = function (binaryReader) {
        console.log('Got Player Look');

        var data = {
            type: binaryReader.readByte(),
            yaw: binaryReader.readFloat(),
            pitch: binaryReader.readFloat(),
            onGround: binaryReader.readBool(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x0D] = function (binaryReader) {
        console.log('Got Player Position & Look');

        console.log('PL packet: ' + util.inspect(binaryReader.getBuffer(), true, null, true));
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

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x0E] = function (binaryReader) {
        console.log('Got Player Digging');

        var data = {
            type: binaryReader.readByte(),
            status: binaryReader.readByte(),
            x: binaryReader.readInt(),
            y: binaryReader.readByte(),
            z: binaryReader.readInt(),
            face: binaryReader.readByte(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x0F] = function (binaryReader) {
        console.log('Got Player Block Placement');

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

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x10] = function (binaryReader) {
        console.log('Got Player Held Item Changed');

        var data = {
            type: binaryReader.readByte(),
            slotId: binaryReader.readShort(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x12] = function (binaryReader) {
        console.log('Got Animation');

        var data = {
            type: binaryReader.readByte(),
            entityId: binaryReader.readInt(),
            animation: binaryReader.readByte(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x13] = function (binaryReader) {
        console.log('Got Entity Action');

        var data = {
            type: binaryReader.readByte(),
            entityId: binaryReader.readInt(),
            action: binaryReader.readByte(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x65] = function (binaryReader) {
        console.log('Got Close Window');

        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x66] = function (binaryReader) {
        console.log('Got Click Window');

        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            slot: binaryReader.readShort(),
            rightClick: binaryReader.readBool(),
            actionNumber: binaryReader.readShort(),
            shift: binaryReader.readBool(),
            clickedItem: binaryReader.readSlot(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x6A] = function (binaryReader) {
        console.log('Got Confirm Transaction');

        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            actionNumber: binaryReader.readShort(),
            accepted: binaryReader.readBool(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x6B] = function (binaryReader) {
        console.log('Got Create Inventory Action');

        var data = {
            type: binaryReader.readByte(),
            slot: binaryReader.readShort(),
            clickedItem: binaryReader.readSlot(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0x6C] = function (binaryReader) {
        console.log('Got Enchant Item');

        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            enchantment: binaryReader.readByte(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
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

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0xCA] = function (binaryReader) {
        console.log('Got Player Abilities');

        var data = {
            type: binaryReader.readByte(),
            flags: binaryReader.readByte(),
            flyingSpeed: binaryReader.readByte(),
            walkingSpeed: binaryReader.readByte(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0xCB] = function (binaryReader) {
        console.log('Got Tab Complete');

        var data = {
            type: binaryReader.readByte(),
            text: binaryReader.readString(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0xCC] = function (binaryReader) {
        console.log('Got Locale and View Distance');

        var data = {
            type: binaryReader.readByte(),
            locale: binaryReader.readString(),
            viewDistance: binaryReader.readByte(),
            chatFlags: binaryReader.readByte(),
            difficulty: binaryReader.readByte()
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0xCD] = function (binaryReader) {
        console.log('Got Client Statuses');

        var data = {
            type: binaryReader.readByte(),
            payload: binaryReader.readByte(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0xFA] = function (binaryReader) {
        console.log('Got Plugin Message');

        var data = {
            type: binaryReader.readByte(),
            channel: binaryReader.readString(),
            length: binaryReader.readShort(),
            data: binaryReader.readArray(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0xFC] = function (binaryReader) {
        console.log('Got Encryption Key Response');

        var data = {
            type: binaryReader.readByte(),
            sharedSecretLength: binaryReader.readShort(),
            sharedSecret: binaryReader.readArray(),
            tokenLength: binaryReader.readShort(),
            token: binaryReader.readArray(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0xFE] = function (binaryReader) {
        console.log('Got Server Ping Packet!');
        return { data: { type: binaryReader.readByte() }, bufferUsed: binaryReader.getPosition() };
    };

    parsers[0xFF] = function (binaryReader) {
        console.log('Got Disconnect/Kick');

        var data = {
            reason: binaryReader.readString(),
        };

        return { data: data, bufferUsed: binaryReader.getPosition() };
    };

    self.parse = function (inputBuffer) {
        var type = inputBuffer[0];
        if (!parsers.hasOwnProperty(type)) {
            return { data: {}, error: 'unknown type: ' + type };
        }

        var binaryReader = new BinaryReader(inputBuffer);
        return parsers[type](binaryReader);
    };
};

module.exports = new clientParser();