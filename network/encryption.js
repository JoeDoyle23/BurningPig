var rsa = require("burningpig-encryption");
var EncryptionStream = require('./encryptionStream');
var PlayerValidator = require('../util/playerValidator');

function Encryption() {
    this.key = new rsa.Key();
};

Encryption.prototype.init = function(serverId) {
    console.log('Generating RSA key...');
    this.key.generate(1024, "10001");
    this.buildASN();
    this.playerValidator = new PlayerValidator(serverId, this.ASN);
};

Encryption.prototype.buildASN = function() {
	var asnHeader = new Buffer('30819F300D06092A864886F70D010101050003818D0030818902818100', 'hex');
	var modBuffer = new Buffer(this.key.n.toString(16), 'hex');
	var expBuffer = new Buffer('0203010001', 'hex');

	this.ASN = Buffer.concat([asnHeader, modBuffer, expBuffer], 162);
};

Encryption.prototype.decryptSharedSecret = function(encyptedSecret) {
	return this.key.decrypt(encyptedSecret);
};

Encryption.prototype.getEncryptor = function() {
	return new EncryptionStream('e');
};

Encryption.prototype.getDecryptor = function() {
	return new EncryptionStream('d');
};

Encryption.prototype.validatePlayer = function(playerName, sharedSecret, callback) {
	return this.playerValidator.validate(playerName, sharedSecret, callback);
}

module.exports = Encryption;