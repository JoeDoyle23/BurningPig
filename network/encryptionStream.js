var crypto = require('crypto');
var util = require('util');
var Stream = require('stream').Stream;

function EncryptionStream(type) {
    Stream.call(this);
    this.writable = true;
    this.readable = true;
    this.type = type;
    this.encryptionEnabled = false;
    this.aes = { final: function(){}};
    this.name = '';
};

util.inherits(EncryptionStream, Stream);

EncryptionStream.prototype.enableEncryption = function (sharedSecret) {

    if(this.type==='e') {
        this.aes = crypto.createCipheriv('AES-128-CFB8', sharedSecret, sharedSecret);
        this.name = 'enc';
    }

    if(this.type==='d') {
        this.aes = crypto.createDecipheriv('AES-128-CFB8', sharedSecret, sharedSecret);
        this.name = 'dec';
    }

    this.aes.setAutoPadding(false);
    this.encryptionEnabled = true;  
};

EncryptionStream.prototype.write = function (data, encoding) {
    if(!this.encryptionEnabled) {
		this.emit('data', data);
        return;
	}

	var encryptedData = new Buffer(this.aes.update(data), 'binary');
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