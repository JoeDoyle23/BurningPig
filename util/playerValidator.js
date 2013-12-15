var request = require('request');
var sessionHash = require('./sessionHash');

function PlayerValidator(serverId, publicKeyASN) {
	this.serverId = serverId;
	this.publicKeyASN = publicKeyASN;
};

PlayerValidator.prototype.validate = function(playerName, sharedSecret, callback) {
	//For testing only
	//callback('YES');
	//return;
	
	var hash = sessionHash(this.serverId, sharedSecret, this.publicKeyASN);
	var url = 'https://sessionserver.mojang.com/session/minecraft/hasJoined?username=' + encodeURIComponent(playerName) + '&serverId=' + encodeURIComponent(hash);

	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    var result = JSON.parse(body);
	    callback({
	    	status: 'success',
	    	uuid: result.id
	    });
	  } else {
	  	callback({
	  		status: 'error',
	  		err: error
	  	});
	  }
	});
}

module.exports = PlayerValidator;