var InventoryHandler = function(world) {

    world.on("held_item_change", function(data, player) {
        player.activeSlot = data.slotId;

        var entityHolding = world.packetWriter.build({
            ptype: 0x05,
            entityId: player.entityId,
            slot: player.activeSlot,
            item: { itemId: -1 }
        });

        world.packetSender.sendToOtherPlayers(entityHolding, player);
    });
};

module.exports = InventoryHandler;