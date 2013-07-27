var BinaryReader = require('../util/binaryReader'),
    util = require('util');

var PacketReader = function () {
    var self = this;

    var parsers = [];

    parsers[0x00] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            keepAliveId: binaryReader.readInt()
        };

        return { type: 'keepalive', data: data };
    };

    parsers[0x02] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            protocol: binaryReader.readByte(),
            username: binaryReader.readString(),
            server: binaryReader.readString(),
            serverPort: binaryReader.readInt()
        };

        return { type: 'handshake', data: data };
    };

    parsers[0x03] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            message: binaryReader.readString()
        };

        return { type: 'chat_message', data: data };
    };

    parsers[0x07] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            user: binaryReader.readInt(),
            target: binaryReader.readInt(),
            mouseButton: binaryReader.readBool()
        };

        return { type: 'use_entity', data: data };
    };

    parsers[0x0A] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            onGround: binaryReader.readBool(),
        };

        return { type: 'player_base', data: data };
    };

    parsers[0x0B] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            x: binaryReader.readDouble(),
            y: binaryReader.readDouble(),
            stance: binaryReader.readDouble(),
            z: binaryReader.readDouble(),
            onGround: binaryReader.readBool(),
        };

        return { type: 'player_position', data: data };
    };

    parsers[0x0C] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            yaw: binaryReader.readFloat(),
            pitch: binaryReader.readFloat(),
            onGround: binaryReader.readBool(),
        };

        return { type: 'player_look', data: data };
    };

    parsers[0x0D] = function (binaryReader) {
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

        return { type: 'player_position_look', data: data };
    };

    parsers[0x0E] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            status: binaryReader.readByte(),
            x: binaryReader.readInt(),
            y: binaryReader.readByte(),
            z: binaryReader.readInt(),
            face: binaryReader.readByte(),
        };

        var types = [ 'digging_start', 'digging_cancelled', 'digging_done'];

        return { type: types[data.status], data: data };
    };

    parsers[0x0F] = function (binaryReader) {
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

        return { type: 'player_block_placement', data: data };
    };

    parsers[0x10] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            slotId: binaryReader.readShort(),
        };

        return { type: 'held_item_change', data: data };
    };

    parsers[0x12] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            entityId: binaryReader.readInt(),
            animation: binaryReader.readByte(),
        };

        return { type: 'animation', data: data };
    };

    parsers[0x13] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            entityId: binaryReader.readInt(),
            actionId: binaryReader.readByte(),
            jumpBoost: binaryReader.readInt()
        };

        return { type: 'entity_action', data: data };
    };

    parsers[0x1B] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            sideways: binaryReader.readFloat(),
            forward: binaryReader.readFloat(),
            jump: binaryReader.readBool(),
            unmount: binaryReader.readBool(),
        };

        return { type: 'steer_vehicle', data: data };
    };

    parsers[0x65] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
        };

        return { type: 'close_window', data: data };
    };

    parsers[0x66] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            slot: binaryReader.readShort(),
            rightClick: binaryReader.readBool(),
            actionNumber: binaryReader.readShort(),
            shift: binaryReader.readBool(),
            clickedItem: binaryReader.readSlot(),
        };

        return { type: 'click_window', data: data };
    };

    parsers[0x6A] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            actionNumber: binaryReader.readShort(),
            accepted: binaryReader.readBool(),
        };

        return { type: 'confirm_transaction', data: data };
    };

    parsers[0x6B] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            slot: binaryReader.readShort(),
            clickedItem: binaryReader.readSlot(),
        };

        return { type: 'creative_inventory_action', data: data };
    };

    parsers[0x6C] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            enchantment: binaryReader.readByte(),
        };

        return { type: 'enchant_item', data: data };
    };

    parsers[0x82] = function (binaryReader) {
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

        return { type: 'update_sign', data: data };
    };

    parsers[0xCA] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            flags: binaryReader.readByte(),
            flyingSpeed: binaryReader.readFloat(),
            walkingSpeed: binaryReader.readFloat(),
        };

        return { type: 'player_abilities', data: data };
    };

    parsers[0xCB] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            text: binaryReader.readString(),
        };

        return { type: 'tab_complete', data: data };
    };

    parsers[0xCC] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            locale: binaryReader.readString(),
            viewDistance: binaryReader.readByte(),
            chatFlags: binaryReader.readByte(),
            difficulty: binaryReader.readByte(),
            showCape: binaryReader.readBool()
        };

        return { type: 'locale_view_distance', data: data };
    };

    parsers[0xCD] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            payload: binaryReader.readByte(),
        };

        return { type: 'client_statuses',  data: data };
    };

    parsers[0xFA] = function (binaryReader) {
        console.log('Got Plugin Message');

        var data = {
            type: binaryReader.readByte(),
            channel: binaryReader.readString(),
            length: binaryReader.readShort()            
        };

        data.data = binaryReader.readArray(data.length);

        return { type: 'plugin_message', data: data };
    };

    parsers[0xFC] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            sharedSecretLength: binaryReader.readShort(),
        };

        data.sharedSecret = binaryReader.readArray(data.sharedSecretLength);
        data.tokenLength = binaryReader.readShort();
        data.token = binaryReader.readArray(data.tokenLength);

        return { type: 'encryption_response', data: data };
    };

    parsers[0xFE] = function (binaryReader) {
        var data = { 
            type: binaryReader.readByte(),
            value: binaryReader.readByte()
        };

        return { type: 'server_list_ping', data: data };
    };

    parsers[0xFF] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            reason: binaryReader.readString(),
        };

        return { type : 'disconnect', data: data };
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