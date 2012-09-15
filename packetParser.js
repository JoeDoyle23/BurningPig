var util = require('util'),
    colors = require('colors'),
    Stream = require('stream').Stream,
    PacketReader = require('./packetReader');

function PacketParser(client) {
    Stream.call(this);
    this.writable = true;
    this.readable = true;
    this.client = client;
    this.packetReader = new PacketReader();
};

util.inherits(PacketParser, Stream);

PacketParser.prototype.write = function (data, encoding) {
    var self = this;

    var allData = Buffer.concat([self.partialData, data], self.partialData.length + data.length);

    do {
        try {
            var packet = self.packetReader.parse(allData);

            if (packet.error) {
                console.log(packet.error);
                //throw { message: packet.err };
            }

            this.emit('data', { data: packet, client: self.client });

            if (allData.length === self.packetReader.bufferUsed) {
                self.partialData = new Buffer(0);
                allData = new Buffer(0);
            } else {
                allData = allData.slice(self.packetReader.bufferUsed);
            }

        } catch (err) {
            if (err.message == "oob"  && !self.client.network.isClosed) {
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

PacketParser.prototype.end = function () {
    this.emit('data', { data: 'end', client: this.client });
};

PacketParser.prototype.error = function (exception) {
    this.emit('data', { data: 'exception', client: this.client, exception: exception });
};

PacketParser.prototype.destroy = function () {
    this.emit('data', { data: 'destroy', client: this.client });
};

PacketParser.prototype.partialData = new Buffer(0);

module.exports = PacketParser;