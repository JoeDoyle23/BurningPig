var http = require('http');
var sessionHash = require('./sessionHash');


function PlayerValidator(serverId, publicKeyASN) {
	this.serverId = serverId;
	this.publicKeyASN = publicKeyASN;
};

PlayerValidator.prototype.validate = function(playerName, sharedSecret) {
	var hash = sessionHash(this.serverId, sharedSecret, this.publicKeyASN);

	var options = {
		host: 'session.minecraft.net',
		port: 80,
		path: '/game/checkserver.jsp?user=' + playerName + '&serverId=' + hash,
		method: 'GET'
	};
};

module.exports = PlayerValidator;