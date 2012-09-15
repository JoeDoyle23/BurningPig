BurningPig
==========

![burningpig](http://joedoyle.us/burningpig.png)

###A Minecraft 1.3.2 Server in Node.js

BurningPig is a custom server for the creative game Minecraft:
<a href="http://minecraft.net">www.minecraft.net</a>

##Direction
I had originally forked the nodecraft project as the start of a modern Minecraft server.  That 
project looked like it was originally built for Node v0.4, and Node has seen alot of improvements 
since then. I also wasn't happy with the way the protocol was being handled. They tried to staticly 
define it, and enough packets are dynamic based on their content that I didn't want to try and fix it.

BurningPig is a fresh start using Node v0.8+ and the goodness it has to offer, like streams!  

##Current Features
* The vanilla client can connect and donwload the (boring) terrain
* Time, so day and night happen
* Chat messages are sent to all connected clients
* Player positions sync'd across connected clients

##What's Next
* Digging!
* Player inventory (only current session, not persisted yet)
* Placing blocks

##Planned Features
* Protocol encryption
* Player validation against minecraft.net
* Loading/Saving the world(s), probably using NBT & Anvil

##License
BuringPig is MIT licensed.  You know the drill.  Enjoy!
