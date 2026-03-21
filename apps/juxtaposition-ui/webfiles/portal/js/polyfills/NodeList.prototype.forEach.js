NodeList.prototype.forEach = function (callback, thisArg) {
	if (typeof callback !== 'function') {
		throw new TypeError(callback + ' is not a function');
	}
	thisArg = thisArg || window;
	for (var i = 0; i < this.length; i++) {
		callback.call(thisArg, this[i], i, this);
	}
};
