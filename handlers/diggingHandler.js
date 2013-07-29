var blockDrops = require('../blockMapping');

var DiggingHandler = function(world) {

    world.on("digging_start", function(data, player) {
       //console.log('Player started digging'.magenta);
        player.digging = {
            Start: process.hrtime(),
            x: data.x,
            y: data.y,
            z: data.z,
            face: data.face
        };
    });

    world.on("digging_cancelled", function(data, player) {
        delete player.digging;
    });

    world.on("digging_done", function(data, player) {
        //console.log('Player stopped digging'.magenta);

        if(!player.validateDigging(data)) {
            player.digging = null;
            return;
        }

        var blockPosition = { x: data.x, y: data.y, z: data.z };
        var dugBlock = world.terrain.getBlock(blockPosition);

        var digResult = blockDrops[dugBlock.blockType];
        console.log(digResult);

        world.terrain.setBlock(blockPosition, { blockType: 0, metadata: 0, light: 0, skylight: 0x00 });

        var dugPacket = world.packetWriter.build({
            ptype: 0x35, 
            x: data.x,
            y: data.y,
            z: data.z,
            blockType: 0,
            blockMetadata: 0
        });

        var entity = {
            ptype: 0x17,
            entityId: world.nextEntityId++,
            type: 2,
            x: (blockPosition.x + 0.5) * 32,
            y: (blockPosition.y + 0.5) * 32,
            z: (blockPosition.z + 0.5) * 32,
            yaw: 0,
            pitch: 0,
            objectData: 0
        };
        
        var entityMetadata = {
            ptype: 0x28,
            entityId: entity.entityId,
            metadata: [{
                index: 10,
                type: 5,
                data: {
                    itemId: digResult.itemId,
                    count: digResult.count,
                    damage: 0,
                    metadata: []
                }
            }]
        };

        world.itemEntities.add(entity);

        var spawnEntity = world.packetWriter.build(entity);
        var spawnEntityMetadata = world.packetWriter.build(entityMetadata);

        world.packetSender.sendToAllPlayers(dugPacket);
        world.packetSender.sendToAllPlayers(spawnEntity);
        //world.packetSender.sendToAllPlayers(spawnEntityMetadata);
    });
};

module.exports = DiggingHandler;