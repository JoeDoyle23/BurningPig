var util = require('util'),
    Stream = require('stream').Stream,
    PacketReader = require('./packetReader');

function PacketStream(player) {
    Stream.call(this);
    this.writable = true;
    this.readable = true;
    this.player = player;
    this.packetReader = new PacketReader();
    this.partialData = new Buffer(0);
};

util.inherits(PacketStream, Stream);

PacketStream.prototype.write = function (data, encoding) {
    var self = this;

    var allData = Buffer.concat([self.partialData, data], self.partialData.length + data.length);

    do {
        try {
            var packet = self.packetReader.parse(allData);

            if (packet.error) {
                //console.log(packet.error);
                //throw { message: packet.err };
            }

            this.emit(packet.type, packet.data, self.player);

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
                throw err;
            }
        }
    } while (allData.length > 0)
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