var crypto = require('crypto');
var util = require('util');

var sessionHash = function (serverId, sharedSecret, publicKeyASN) {

    var twosCompliment = function(hash)
        {
            var carry = true;
            for (var i = hash.length - 1; i >= 0; i--) {
                hash[i] = ((~hash[i]) & 0xFF);
                if (carry) {
                    carry = hash[i] == 0xFF;
                    hash[i]++;
                }
            }
            return hash;
        }

    var sha = crypto.createHash('sha1');
    sha.update(serverId);
    sha.update(sharedSecret);
    sha.update(publicKeyASN);

    var computedHash = new Buffer(sha.digest(), 'binary');
    var hashString = '', minusSign = '';

    if ((computedHash[0] & 0x80) === 0x80) {
        minusSign = '-';       
        hashString = twosCompliment(computedHash).toString('hex');
    } else {
        hashString = computedHash.toString('hex');
    }

    while(hashString[0]==='0') {
        hashString = hashString.slice(1);
    }

    console.log('hash: ' + minusSign + hashString);
    return minusSign + hashString;
}

module.exports = sessionHash;