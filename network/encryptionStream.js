var crypto = require('crypto');
var util = require('util');
var Transform = require('stream').Transform;

function EncryptionStream(type) {

  if (!(this instanceof EncryptionStream))
    return new EncryptionStream(type);

    Transform.call(this, type);

    this.type = type;
    this.encryptionEnabled = false;
    this.aes = { final: function(){}};
    this.name = '';
};

EncryptionStream.prototype = Object.create(
  Transform.prototype, { constructor: { value: EncryptionStream }});

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

EncryptionStream.prototype._transform = function(chunk, encoding, done) {
    if(!this.encryptionEnabled) {
		this.push(chunk);
        done();
        return;
	}

	var encryptedData = new Buffer(this.aes.update(chunk), 'binary');
    //console.log(encryptedData);
    this.push(encryptedData);
    done();
};

EncryptionStream.prototype.destroy = function () {
    this.emit('destroy');
    this.aes.final();
};

module.exports = EncryptionStream;