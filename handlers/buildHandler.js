var BuildHandler = function(world) {

    world.on("player_block_placement", function(data, player) {

        console.log(data);
        if(data.x === -1 && data.y === 255 && data.z === -1 && data.direction === 255) {
            //TODO: Handle eating/shooting
            return;
        }

        var blockPosition = {
            x: data.x,
            y: data.y,
            z: data.z
        };
        
        switch(data.direction) {
            case 0:
                blockPosition.y--;
                break;
            case 1:
                blockPosition.y++;
                break;
            case 2:
                blockPosition.z--;
                break;
            case 3:
                blockPosition.z++;
                break;
            case 4:
                blockPosition.x--;
                break;
            case 5:
                blockPosition.x++;
                break;
        }

        //console.log('Block placement:');
        //console.log(blockPosition);

        if(data.heldItem.itemId === -1) {
            return;
        }

        world.terrain.setBlock(blockPosition, {
            blockType: data.heldItem.itemId,
            metadata: 0,
            light: 0,
            skylight: 0xF
        });

        var blockChange = world.packetWriter.build({ 
            ptype: 0x35,
            x: blockPosition.x,
            y: blockPosition.y,
            z: blockPosition.z,
            blockType: data.heldItem.itemId,
            blockMetadata: 0
        });

        world.packetSender.sendToAllPlayers(blockChange);
        world.emit('update_lighting', blockPosition);
    });
};

module.exports = BuildHandler;