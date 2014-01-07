var packets = require('../network/packetList').serverPackets

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
            ptype: packets.HeldItemChange,
            entityId: player.entityId,
            slot: data.slotId,
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
                ptype: packets.CollectItem, 
                collectedId: entity.entityId,
                collectorId: player.entityId
            });

            destroyClientIds.push(entity.entityId);
            world.itemEntities.remove(entity.entityId);

            world.packetSender.sendToAllPlayers(pickupEntity);
            world.emit('item_pickup', entity, player);
        }

        if(destroyClientIds.length > 0) {
            var destroyItem = world.packetWriter.build({
                ptype: packets.DestroyEntities,
                entityIds: destroyClientIds
            });

            world.packetSender.sendToAllPlayers(destroyItem);
        }
    });

    world.on('item_pickup', function(data, player) {
        if(!player.inventory[player.activeSlot]) {
            player.inventory[player.activeSlot] = data;    
        } else {
            player.inventory[player.activeSlot].count += data.count;
        }

        return;
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