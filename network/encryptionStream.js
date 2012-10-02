var crypto = require('crypto');
var util = require('util');
var Stream = require('stream').Stream;

function EncryptionStream(type, sharedSecret) {
    Stream.call(this);
    this.writable = true;
    this.readable = true;

    this.aes = crypto.createCipheriv('AES-128-CFB', sharedSecret, sharedSecret);
    
    if(type==='d') {
        this.aes = crypto.createDecipheriv('AES-128-CFB', sharedSecret, sharedSecret);
    }

    this.aes.setAutoPadding(false);

    this.encryptionEnabled = false;
};

util.inherits(EncryptionStream, Stream);

EncryptionStream.prototype.write = function (data, encoding) {
	if(!this.encryptionEnabled) {
		this.emit('data', data);
	}
	var encryptedData = this.aes.update(data);
	this.emit('data', encryptedData);
};

EncryptionStream.prototype.end = function () {
    this.emit('end');
    this.aes.final();
};

EncryptionStream.prototype.error = function () {
    this.emit('error');
    this.aes.final();
};

EncryptionStream.prototype.destroy = function () {
    this.emit('destroy');
    this.aes.final();
};


module.exports = EncryptionStream;