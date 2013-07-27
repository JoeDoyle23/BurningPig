var ServerPingHandler = function(world) {

    world.on("server_list_ping", function(data, player) {

      var serverStatus = ['§1', '74', '1.6.2', world.settings.serverName, world.playerEntities.count(), world.settings.maxPlayers].join('\0');
      var packet = world.packetWriter.build({ ptype: 0xFF, serverStatus: serverStatus });

      world.packetSender.sendPacket(player, packet);
      world.packetSender.closeConnection(player);
  });
};

module.exports = ServerPingHandler;
