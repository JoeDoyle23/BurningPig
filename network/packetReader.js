var BinaryReader = require('../util/binaryReader'),
    packets = require('./packetList').clientPackets,
    util = require('util');

var PacketReader = function () {
    var self = this;

    var parsers = [];

    parsers[packets.KeepAlive] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            keepAliveId: binaryReader.readInt()
        };

        return { type: 'keepalive', data: data };
    };

    parsers[packets.ChatMessage] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            message: binaryReader.readString()
        };

        return { type: 'chat_message', data: data };
    };

    parsers[packets.UseEntity] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            target: binaryReader.readInt(),
            mouse: binaryReader.readByte()
        };

        return { type: 'use_entity', data: data };
    };

    parsers[packets.Player] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            onGround: binaryReader.readBool(),
        };

        return { type: 'player_base', data: data };
    };

    parsers[packets.PlayerPosition] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            x: binaryReader.readDouble(),
            stance: binaryReader.readDouble(),
            y: binaryReader.readDouble(),
            z: binaryReader.readDouble(),
            onGround: binaryReader.readBool(),
        };

        return { type: 'player_position', data: data };
    };

    parsers[packets.PlayerLook] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            yaw: binaryReader.readFloat(),
            pitch: binaryReader.readFloat(),
            onGround: binaryReader.readBool(),
        };

        return { type: 'player_look', data: data };
    };


    parsers[packets.PlayerPositionAndLook] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            x: binaryReader.readDouble(),
            stance: binaryReader.readDouble(),
            y: binaryReader.readDouble(),
            z: binaryReader.readDouble(),
            yaw: binaryReader.readFloat(),
            pitch: binaryReader.readFloat(),
            onGround: binaryReader.readBool(),
        };

        return { type: 'player_position_look', data: data };
    };


    parsers[packets.PlayerDigging] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            status: binaryReader.readByte(),
            x: binaryReader.readInt(),
            y: binaryReader.readByte(),
            z: binaryReader.readInt(),
            face: binaryReader.readByte(),
        };

        var types = [ 'digging_start', 'digging_cancelled', 'digging_done', 'drop_item_stack', 'drop_item', 'shoot_eating'];

        return { type: types[data.status], data: data };
    };

    parsers[packets.PlayerBlockPlacement] = function (binaryReader) {
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

    parsers[packets.HeldItemChange] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            slotId: binaryReader.readShort(),
        };

        return { type: 'held_item_change', data: data };
    };

    parsers[packets.Animation] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            entityId: binaryReader.readInt(),
            animation: binaryReader.readByte(),
        };

        return { type: 'animation', data: data };
    };

    parsers[packets.EntityAction] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            entityId: binaryReader.readInt(),
            actionId: binaryReader.readByte(),
            jumpBoost: binaryReader.readInt()
        };

        return { type: 'entity_action', data: data };
    };

    parsers[packets.SteerVehicle] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            sideways: binaryReader.readFloat(),
            forward: binaryReader.readFloat(),
            jump: binaryReader.readBool(),
            unmount: binaryReader.readBool(),
        };

        return { type: 'steer_vehicle', data: data };
    };

    parsers[packets.CloseWindow] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
        };

        return { type: 'close_window', data: data };
    };

    parsers[packets.ClickWindow] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            slot: binaryReader.readShort(),
            button: binaryReader.readByte(),
            actionNumber: binaryReader.readShort(),
            mode: binaryReader.readByte(),
            clickedItem: binaryReader.readSlot(),
        };

        return { type: 'click_window', data: data };
    };

    parsers[packets.ConfirmTransaction] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            actionNumber: binaryReader.readShort(),
            accepted: binaryReader.readBool(),
        };

        return { type: 'confirm_transaction', data: data };
    };

    parsers[packets.CreativeInventoryAction] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            slot: binaryReader.readShort(),
            clickedItem: binaryReader.readSlot(),
        };

        return { type: 'creative_inventory_action', data: data };
    };

    parsers[packets.EnchantItem] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            windowId: binaryReader.readByte(),
            enchantment: binaryReader.readByte(),
        };

        return { type: 'enchant_item', data: data };
    };

    parsers[packets.UpdateSign] = function (binaryReader) {
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

    parsers[packets.PlayerAbilities] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            flags: binaryReader.readByte(),
            flyingSpeed: binaryReader.readFloat(),
            walkingSpeed: binaryReader.readFloat(),
        };

        return { type: 'player_abilities', data: data };
    };

    parsers[packets.TabComplete] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            text: binaryReader.readString(),
        };

        return { type: 'tab_complete', data: data };
    };

    parsers[packets.ClientSettings] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            locale: binaryReader.readString(),
            viewDistance: binaryReader.readByte(),
            chatFlags: binaryReader.readByte(),
            chatColors: binaryReader.readBool(),
            difficulty: binaryReader.readByte(),
            showCape: binaryReader.readBool()
        };

        return { type: 'client_settings', data: data };
    };

    parsers[packets.ClientStatus] = function (binaryReader) {
        var data = {
            type: binaryReader.readByte(),
            actionId: binaryReader.readByte(),
        };

        return { type: 'client_status',  data: data };
    };

    parsers[packets.PluginMessage] = function (binaryReader) {
        console.log('Got Plugin Message');

        var data = {
            type: binaryReader.readByte(),
            channel: binaryReader.readString(),
            length: binaryReader.readShort()            
        };

        data.data = binaryReader.readArray(data.length);

        return { type: 'plugin_message', data: data };
    };

    // parsers[0x02] = function (binaryReader) {
    //     var data = {
    //         type: binaryReader.readByte(),
    //         protocol: binaryReader.readByte(),
    //         username: binaryReader.readString(),
    //         server: binaryReader.readString(),
    //         serverPort: binaryReader.readInt()
    //     };

    //     return { type: 'handshake', data: data };
    // };

    // parsers[0xFC] = function (binaryReader) {
    //     var data = {
    //         type: binaryReader.readByte(),
    //         sharedSecretLength: binaryReader.readShort(),
    //     };

    //     data.sharedSecret = binaryReader.readArray(data.sharedSecretLength);
    //     data.tokenLength = binaryReader.readShort();
    //     data.token = binaryReader.readArray(data.tokenLength);

    //     return { type: 'encryption_response', data: data };
    // };

    // parsers[0xFE] = function (binaryReader) {
    //     var data = { 
    //         type: binaryReader.readByte(),
    //         value: binaryReader.readByte()
    //     };

    //     return { type: 'server_list_ping', data: data };
    // };

    // parsers[0xFF] = function (binaryReader) {
    //     var data = {
    //         type: binaryReader.readByte(),
    //         reason: binaryReader.readString(),
    //     };

    //     return { type : 'disconnect', data: data };
    // };

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