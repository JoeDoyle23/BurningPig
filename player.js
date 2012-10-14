
function Player(clientObject) {
    this.entityType = 'player';
    this.name = clientObject.playername;
    this.entityId = -1;
    this.x = 0;
    this.y = 64.5;
    this.z = 0;
    this.oldx = 0;
    this.oldy = 64.5;
    this.oldz = 0;
    this.stance = 66.12;
    this.yaw = 0;
    this.pitch = 0;
    this.onGround = true;
    this.rawping = [];
    this.digging = {};

    this.inventory = {};
    this.activeSlot = 0;
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
        x: Math.round(this.x * 32),
        y: Math.round(this.y * 32),
        z: Math.round(this.z * 32),
        yaw: (((Math.floor(this.yaw) % 360) / 360) * 256) & 0xFF,
        pitch: (((Math.floor(this.pitch) % 360) / 360) * 256) & 0xFF
      };
};

Player.prototype.getAbsoluteDelta = function () {
    return {
        x: Math.round(this.x * 32 - this.oldx * 32),
        y: Math.round(this.y * 32 - this.oldy * 32),
        z: Math.round(this.z * 32 - this.oldz * 32),
        yaw: (((Math.floor(this.yaw) % 360) / 360) * 256) & 0xFF,
        pitch: (((Math.floor(this.pitch) % 360) / 360) * 256) & 0xFF
    };
};

Player.prototype.updatePosition = function (newPosition) {
    var coordCheck = function (value, newValue) {
        return Math.abs(value - newValue) <= 100;
    }

    if (newPosition.hasOwnProperty('yaw')) {
        this.yaw = newPosition.yaw;
    }

    if (newPosition.hasOwnProperty('pitch')) {
        this.pitch = newPosition.pitch;
    }

    if (newPosition.hasOwnProperty('onGround')) {
        this.onGround = newPosition.onGround;
    }

    if (newPosition.hasOwnProperty('x')) {
        if (!coordCheck(this.x, newPosition.x)) {
            return false;
        }

        this.oldx = this.x;
        this.x = newPosition.x;
    }

    if (newPosition.hasOwnProperty('y')) {
        if (!coordCheck(this.y, newPosition.y)) {
            return false;
        }

        this.oldy = this.y;
        this.y = newPosition.y;
    }

    if (newPosition.hasOwnProperty('z')) {
        if (!coordCheck(this.z, newPosition.z)) {
            return false;
        }

        this.oldz = this.z;
        this.z = newPosition.z;
    }

    if (newPosition.hasOwnProperty('stance')) {
        this.stance = newPosition.stance;
    }

    return true;
};

Player.prototype.validateDigging = function (digInfo) {
    this.digging.Stop = process.hrtime(this.digging.Start);

    //TODO: really validate digging based on tool and block

    if(this.digging.x !== digInfo.x ||
       this.digging.y !== digInfo.y ||
       this.digging.z !== digInfo.z ||
       this.digging.face !== digInfo.face) {
        return false;
    }

    return true;
};

module.exports = Player;