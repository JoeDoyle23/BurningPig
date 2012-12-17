var http = require('http');
var sessionHash = require('./sessionHash');

function PlayerValidator(serverId, publicKeyASN) {
	this.serverId = serverId;
	this.publicKeyASN = publicKeyASN;
};

PlayerValidator.prototype.validate = function(playerName, sharedSecret, callback) {
	//For testing only
	callback('YES');
	return;
	
	var hash = sessionHash(this.serverId, sharedSecret, this.publicKeyASN);

	var url = 'http://session.minecraft.net/game/checkserver.jsp?user=' + playerName + '&serverId=' + hash;
	
	http.get(url, function(res) {
		res.setEncoding('utf8');
	    res.on('data', function (chunk) {
		    //console.log('BODY: ' + chunk);
	        callback(chunk);
		});
	});
}

module.exports = PlayerValidator;