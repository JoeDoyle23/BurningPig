
var EntityCollection = function() {
	this.entities = [];
	this.itemcount = 0;
};

EntityCollection.prototype.add = function(item) {
	this.entities[item.entityId] = item;
	this.itemcount++;
};

EntityCollection.prototype.remove = function(itemId) {
	var idFilter = function(item, index) {
		return item.entityId===itemId;
	};

	delete this.entities[itemId];
	this.itemcount--;
};

EntityCollection.prototype.getAll = function() {
	return this.entities;
}

EntityCollection.prototype.count = function() {
	return this.itemcount;
}

EntityCollection.prototype.getItemsInVisualRange = function(position) {
	var visualDistanceFilter = function(item) {
		var xs = item.x - position.x;
			xs = xs * xs;
		var ys = item.y - position.y;
			ys = ys * ys;
		var zs = item.z - position.z;
			zs = zs * zs;
			return xs+ys+zs < 1000000;//TODO: Need to get the correct value for this. Per player?
	};

	return this.entities.filter(visualDistanceFilter);
};

EntityCollection.prototype.getItemsInPickupRange = function(position) {
	var pickupDistanceFilter = function(item) {
		var xs = item.x - position.x;
			xs = xs * xs;
		var ys = item.y - position.y;
			ys = ys * ys;
		var zs = item.z - position.z;
			zs = zs * zs;
			return xs+ys+zs < 2200; //TODO: Need to get the correct value for this
	};

	return this.entities.filter(pickupDistanceFilter);
};

module.exports = EntityCollection;