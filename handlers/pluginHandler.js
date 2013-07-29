var PluginHandler = function(world) {

    world.on("plugin_message", function(data, player) {
        console.log('Got pluginMessage on channel ' + data.channel);
   });
};

module.exports = PluginHandler