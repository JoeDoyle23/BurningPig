var util = require('util'),
    colors = require('colors'),
    Stream = require('stream').Stream,
    packetReader = require('./packetReader');

function PacketParser(client) {
    Stream.call(this);
    this.writable = true;
    this.readable = true;
    this.client = client;
};

util.inherits(PacketParser, Stream);

PacketParser.prototype.write = function (data, encoding) {

    var allData = Buffer.concat([this.partialData, data], this.partialData.length + data.length);

    do {
        try {
            var packet = packetReader.parse(allData);

            if (packet.error) {
                console.log(packet.error);
                //throw { message: packet.err };
            }

            this.emit('data', { data: packet, client: this.client });

            if (allData.length === packetReader.bufferUsed) {
                this.partialData = new Buffer(0);
                allData = new Buffer(0);
            } else {
                allData = allData.slice(packetReader.bufferUsed);
            }

        } catch (err) {
            if (err.message == "oob") {
                console.log('OOB detected'.red);
                partialData = allData;
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