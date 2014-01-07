var util = require('util'),
    Writable = require('stream').Writable,
    PacketReader = require('./packetReader');

function PacketStream (world, player) {
    if (!(this instanceof PacketStream))
        return new PacketStream(player);

    Writable.call(this, player);
    
    this.player = player;
    this.world = world;
    this.state = 0;
    this.packetReader = new PacketReader();
    this.partialData = new Buffer(0);
};

PacketStream.prototype = Object.create(
  Writable.prototype, { constructor: { value: PacketStream }});

PacketStream.prototype._write = function (data, encoding, cb) {
    var self = this;

    var allData = Buffer.concat([self.partialData, data], self.partialData.length + data.length);

    do {
        try {
            var packet = self.packetReader.parse(allData, this);

            if (packet.error) {
                //console.log(packet.error);
                //throw { message: packet.err };
            }

            //console.log('emitting: ' + packet.type);
            this.world.emit(packet.type, packet.data, self.player);

            if (allData.length === self.packetReader.bufferUsed) {
                self.partialData = new Buffer(0);
                allData = new Buffer(0);
            } else {
                allData = allData.slice(self.packetReader.bufferUsed);
            }

        } catch (err) {
            if (err.message == "oob"  && !self.player.network.isClosed) {
                console.log('OOB detected'.red);
                self.partialData = allData;
                break;
            } else {
                console.log('Exception!:\n'.red + err);
                cb(err);
                throw err;
            }
        }
    } while (allData.length > 0)

    cb();
};

PacketStream.prototype.end = function () {
    this.emit('end', this.player);
};

PacketStream.prototype.error = function (exception) {
    this.emit('exception', this.player, exception);
};

PacketStream.prototype.destroy = function () {
    this.emit('destroy', this.player);
};

module.exports = PacketStream;