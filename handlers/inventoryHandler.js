var InventoryHandler = function(world) {

    world.on("held_item_change", function(data, player) {
        player.activeSlot = data.slotId + 36;
        var item = { itemId: -1};
        
        if(player.inventory[player.activeSlot]) {
            item = { 
                itemId: player.inventory[player.activeSlot].itemId,
                count: 1,
                damage: 0,
                nbtlength: 0
            }
        }

        var entityHolding = world.packetWriter.build({
            ptype: 0x05,
            entityId: player.entityId,
            slot: 0,
            item: item
        });

        world.packetSender.sendToOtherPlayers(entityHolding, player);
    });

    world.on('check_for_pickups', function(player) {
        var pos = player.getAbsolutePosition();
        var entities = world.itemEntities.getItemsInPickupRange({x: pos.x, y: pos.y, z: pos.z});

        var destroyClientIds = [];

        for(var i=0,j=entities.length;i<j;i++) {
            var entity = entities[i];
            var pickupEntity = world.packetWriter.build({
                ptype: 0x16, 
                collectedId: entity.entityId,
                collectorId: player.entityId
            });

            destroyClientIds.push(entity.entityId);
            world.itemEntities.remove(entity.entityId);

            world.packetSender.sendToAllPlayers(pickupEntity);
            world.emit('item_pickup', entity, player);
        }
        
        var destroyItem = world.packetWriter.build({
            ptype: 0x1D,
            entityIds: destroyClientIds
        });

        world.packetSender.sendToAllPlayers(destroyItem);
    });

    world.on('item_pickup', function(data, player) {
        if(!player.inventory[player.activeSlot]) {
            player.inventory[player.activeSlot] = data;    
        } else {
            player.inventory[player.activeSlot].count += data.count;
        }

        var inventoryUpdate = world.packetWriter.build({
            ptype: 0x67, 
            windowId: 0,
            slot: player.activeSlot,
            entity: {
                itemId: data.itemId,
                count: player.inventory[player.activeSlot].count,
                damage: data.damage || 0,
                nbtlength: -1
            }
        });

        world.packetSender.sendPacket(player, inventoryUpdate);
    })
};

module.exports = InventoryHandler;