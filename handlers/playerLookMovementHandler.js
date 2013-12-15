var packets = require('../network/packetList').serverPackets

var PlayerLookMovementHandler = function (world) {

    world.on("player_base", function (data, player) {
        player.updatePosition(data);
    });

    world.on("player_position", function(data, player) {
        var goodUpdate = player.updatePosition(data);
        
        return;
        if (goodUpdate) {
            var position = player.getAbsoluteDelta();
            var update = world.packetWriter.build({
                ptype: 0x1F, 
                entityId: player.entityId,
                dX: position.x,
                dY: position.y,
                dZ: position.z,
            });
            world.packetSender.sendToOtherPlayers(update, player);
            world.emit('check_for_pickups', player);
        }
    });

    world.on("player_look", function (data, player) {
        var goodUpdate = player.updatePosition(data);
        if (goodUpdate) {
            var position = player.getAbsoluteDelta();
            var update = world.packetWriter.build({
                ptype: 0x20, 
                entityId: player.entityId,
                yaw: position.yaw,
                pitch: position.pitch,
            });

            var headLook = world.packetWriter.build({
                ptype: 0x23, 
                entityId: player.entityId,
                headYaw: position.yaw,
            });

            world.packetSender.sendToOtherPlayers(Buffer.concat([update, headLook], update.length+headLook.length), player);
        }
    });

    world.on("player_position_look", function (data, player) {
        var goodUpdate = player.updatePosition(data);

        return;

        if (goodUpdate) {
            var position = player.getAbsoluteDelta();
            console.log(position);
            var update = world.packetWriter.build({
                ptype: packets.EntityLookAndRelativeMove, 
                entityId: player.entityId,
                dX: position.x,
                dY: position.y,
                dZ: position.z,
                yaw: position.yaw,
                pitch: position.pitch,
            });
            world.packetSender.sendToOtherPlayers(update, player);
            world.emit('check_for_pickups', player);
        }
    });

    world.on("animation", function(data, player) {
        var packet = world.packetWriter.build({
            ptype: 0x12, 
            entityId: data.entityId,
            animation: data.animation
        });
        world.packetSender.sendToOtherPlayers(packet, player);
    });
};

module.exports = PlayerLookMovementHandler;