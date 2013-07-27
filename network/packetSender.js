var PacketSender = function(world) {
    this.world = world;
};

PacketSender.prototype.sendPacket = function(player, packet) {
    player.network.write(packet);
};

PacketSender.prototype.sendToAllPlayers = function (packet) {
    this.world.playerEntities.getAll().forEach(function (player, idx) {
        player.network.write(packet);
    });
};

PacketSender.prototype.sendToOtherPlayers = function (packet, sourcePlayer) {
    this.world.playerEntities.getAll().forEach(function (player, idx) {
        if (sourcePlayer.id !== player.id) {
            player.network.write(packet);
        }
    });
};

PacketSender.prototype.closeConnection = function(player) {
    player.network.end();
};

module.exports = PacketSender;