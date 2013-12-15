var packets = require('../network/packetList').serverPackets;

var TimeHandler = function(world) {

    var dayTime = new Buffer(8);

    world.on("game_tick", function(data) {
        var timeHigh = world.worldTime.readUInt32BE(0, 4);
        var timeLow = world.worldTime.readUInt32BE(4, 4) + 1;
        if (timeLow & 0xFFFF === 0) {
            timeHigh++;
        }
        world.worldTime.writeUInt32BE(timeHigh, 0);
        world.worldTime.writeUInt32BE(timeLow, 4);

        dayTime.fill(0);
        dayTime.writeUInt16BE(timeLow % 24000, 6);

        var time = world.packetWriter.build({ ptype: packets.TimeUpdate, worldAge: world.worldTime, time: dayTime });
        world.packetSender.sendToAllPlayers(time);

        var packetLength = 0;
        
        // world.playerEntities.getAll().forEach(function (player, idx) {
        //     var cPing = player.getPing();

        //     var playerlist = world.packetWriter.build({
        //         ptype: packets.PlayerListItem,
        //         playerName: player.name,
        //         online: true,
        //         ping:  cPing > 0x7FFF ? 0x7FFF : cPing
        //     });
        //     console.log(playerlist);
        //     world.packetSender.sendToAllPlayers(playerlist);
        // });
    });
};

module.exports = TimeHandler;