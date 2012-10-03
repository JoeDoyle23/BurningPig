var crypto = require('crypto');
var util = require('util');

var sessionHash = function (serverId, sharedSecret, publicKeyASN) {

    var sha = crypto.createHash('sha1');
    sha.update(serverId);
    sha.update(sharedSecret);
    sha.update(publicKeyASN);

    var hexString = sha.digest('hex');
    
    if ((parseInt(hexString[0]) & 8) === 8) {
        var newString = '-';
        for (var i = 0; i < hexString.length; i += 2) {
            var n = hexString.slice(i, i + 2);
            var nn = parseInt(n, 16);
            var qq = ((~nn) & 0xFF);

            if (qq.toString(16).length === 1) {
                newString += '0';
            }

            newString += qq.toString(16).slice(0, 1);

            if (i === (hexString.length - 2)) {
                qq++;
            }
            
            newString += qq.toString(16).slice(1);
        }
        //console.log(newString);
        return newString;
    }

    return hexString;

}

module.exports = sessionHash;