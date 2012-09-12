var util = require('util'),
    Stream = require('stream').Stream,
    clientParser = require('./clientParser');

function PacketParser() {
    Stream.call(this);
    this.writable = true;
    this.readable = true;    
};

util.inherits(PacketParser, Stream);

PacketParser.prototype.write = function (data, encoding) {

    var allData = Buffer.concat([this.partialData, data], this.partialData.length + data.length);

    do {
        try {
            var packet = clientParser.parse(allData);

            if (packet.error) {
                console.log(packet.error);
                //throw { message: packet.err };
            }

            //console.log("Packet data: " + util.inspect(packet, true, null, true));
            this.emit('data', packet.data);

            if (allData.length === packet.bufferUsed) {
                this.partialData = new Buffer(0);
                allData = new Buffer(0);
            } else {
                allData = allData.slice(packet.bufferUsed);
            }

        } catch (err) {
            if (err.message == "oob") {
                console.log('oob detected');
                partialData = allData;
                break;
            } else {
                console.log('Exception!:\n' + err);
                throw err;
            }
        }
    } while (allData.length > 0)
};

PacketParser.prototype.end = function () {
    this.emit('end');
};

PacketParser.prototype.error = function () {
    this.emit('error');
};

PacketParser.prototype.destroy = function () {
    this.emit('destroy');
};

PacketParser.prototype.partialData = new Buffer(0);

module.exports = PacketParser;