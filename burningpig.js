var colors = require('colors'),
    TcpServer = require('./network/tcpServer'),
    World = require('./world');

console.log('Lighting up the BurningPig!'.bold);
    
var world = new World();
world.startWorld();

var server = TcpServer(world);
server.listen(world.settings.listenPort);

console.log('Server listening on port %d.'.green, world.settings.listenPort);