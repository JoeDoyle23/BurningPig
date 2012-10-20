
var EntityCollection = function() {
	var self = this;

	this.entities = [];
};

EntityCollection.prototype.add = function(item) {
	this.entities.push(item);
};

EntityCollection.prototype.remove = function(itemId) {
	var idFilter = function(item, index) {
		return item.entityId===itemId;
	};

	var itemToRemove = this.entities.filter(idFilter);
	var index = this.entities.indexOf(itemToRemove[0]);
	if(index===-1) {
		console.log('couldnt find entity');
		return;		
	}		

	return this.entities.splice(index);
};

EntityCollection.prototype.getAll = function() {
	return this.entities;
}

EntityCollection.prototype.count = function() {
	return this.entities.length;
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
			console.log(xs+ys+zs);
			return xs+ys+zs < 4800; //TODO: Need to get the correct value for this
	};

	return this.entities.filter(pickupDistanceFilter);
};

module.exports = EntityCollection;