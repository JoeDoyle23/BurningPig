
function Player(clientObject) {
    this.entityType = 'player';
    this.name = clientObject.playername;
    this.entityId = -1;
    this.x = 0;
    this.y = 64.5;
    this.z = 0;
    this.stance = 66.12;
    this.yaw = 0;
    this.pitch = 0;
    this.onGround = true;
    this.rawping = [];
};

Player.prototype.getPing = function () {
    if (this.rawping.length === 0)
        return 0;

    var ping = this.rawping[0] * 1000;
    ping += Math.round(this.rawping[1] / 1000000);

    return Math.round(ping / 2);    
}

Player.prototype.getPositionLook = function () {
    return {
        x: this.x,
        y: this.y,
        z: this.x,
        stance: this.stance,
        yaw: this.yaw,
        pitch: this.pitch,
        onGround: this.onGround
    };
};

Player.prototype.getPosition = function () {
    return {
        x: this.x,
        y: this.y,
        z: this.x,
        stance: this.stance,
        onGround: this.onGround
    };
};

Player.prototype.getLook = function () {
    return {
        yaw: this.yaw,
        pitch: this.pitch,
        onGround: this.onGround
    };
};

Player.prototype.getAbsolutePosition = function() {
    return {
        x: Math.round(this.x) * 32,
        y: Math.round(this.y) * 32,
        z: Math.round(this.z) * 32,
        yaw: (((Math.floor(this.yaw) % 360) / 360) * 256) & 0xFF,
        pitch: (((Math.floor(this.pitch) % 360) / 360) * 256) & 0xFF
      };
};

Player.prototype.updatePosition = function (newPosition) {

    var coordCheck = function (value, newValue) {
        return Math.abs(value - newValue) <= 100;
    }

    if (newPosition.yaw) {
        this.yaw = newPosition.yaw;
    }

    if (newPosition.pitch) {
        this.yaw = newPosition.pitch;
    }

    if (newPosition.onGround) {
        this.onGround = newPosition.onGround;
    }

    if (newPosition.x) {
        if (!coordCheck(this.x, newPosition.x)) {
            return false;
        }

        this.x = newPosition.x;
    }

    if (newPosition.y) {
        if (!coordCheck(this.y, newPosition.y)) {
            return false;
        }

        this.y = newPosition.y;
    }

    if (newPosition.z) {
        if (!coordCheck(this.z, newPosition.z)) {
            return false;
        }

        this.z = newPosition.z;
    }

    if (newPosition.stance) {
        this.stance = newPosition.stance;
    }

    return true;
};

Player.prototype.startDigging = function (newPosition) {

};

Player.prototype.stopDigging = function (newPosition) {

};

module.exports = Player;