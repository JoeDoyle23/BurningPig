var ChatHandler = function(world) {

    world.on("chat_message", function(data, player) {
        if (data.message.length > 100)
            data.message = data.message.slice(0, 100);

        var m = {
            translate: "chat.type.announcement",
            using: ["Server", player.name + ': ' + data.message]
        };

        console.log('Chat Message:');
        console.log(JSON.stringify(m));
        var chat = world.packetWriter.build({ ptype: 0x03, message: JSON.stringify(m) });

        if(data.message === '/players') {
            console.log(world.playerEntities.getAll());
        }

        world.packetSender.sendToAllPlayers(chat);
    });

    world.on("tab_complete", function(data, player) {
        console.log('Got tabComplete, need to add code!'.red);
    });
};

module.exports = ChatHandler;