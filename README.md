BurningPig
==========

![burningpig](http://joedoyle.us/burningpig.png)

###A Minecraft 1.6.4 Server in Node.js

BurningPig is a custom server for the creative game Minecraft:
<a href="http://minecraft.net">www.minecraft.net</a>

##Direction
I had originally forked the nodecraft project as the start of a modern Minecraft server.  That 
project looked like it was originally built for Node v0.4, and Node has seen alot of improvements 
since then. I also wasn't happy with the way the protocol was being handled. They tried to staticly 
define it, and enough packets are dynamic based on their content that I didn't want to try and fix it.

BurningPig was a fresh start using Node v0.8+ and the goodness it has to offer, like streams!  

**Node v0.10.* is now required for streams2 support!** - I'll add backwards compat soon.

##Current Features
* The vanilla client can connect and donwload the (boring) terrain
* Time, so day and night happen
* Chat messages are sent to all connected clients
* Player positions sync'd across connected clients
* Server settings are now stored in 'settings.json'.
* Digging! & persistent terrain
* Pickups after digging
* Placing blocks
* Protocol encryption
* Player validation against minecraft.net
* Node v0.10.* is now required!

##What's Next
* Player inventory (only current session, not persisted yet)
* Terrain lighting
* Terrain generation

##On The Way
* Persisted Players & Inventory
* Game tick events (ex: water flowing, grass growing, etc)
* Dynamic client chunk loading/unloading

##Server Settings
The settings that control the server options are stored in the settings.json file.

Current settings:
serverName - The name of the server that shows up in the Multiplayer server screen.  
listenPort - The TCP port the server listens on.  
maxPlayers - The maximium number of players the server supports.  
gameMode - The game mode  
dimension - The dimension of the world  
difficulty - World difficulty  

Example:

    {
        "serverName": "BurningPig DevServer!",
        "listenPort": 25565,
        "maxPlayers": 8,
        "gameMode": 0,
        "dimension": 0,
        "difficulty": 1
    }

##Installing BurningPig

Using NPM, installing is as easy as:
    npm install burningpig
	
## Live Test Server

Once I get a little further along, I will put up a test server where people can check out the latest version.

##License
BurningPig is MIT licensed.  You know the drill.  Enjoy!
