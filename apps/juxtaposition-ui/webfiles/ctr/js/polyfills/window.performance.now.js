self.performance = {};

var nowOffset = Date.now();
self.performance.now = function now() {
	return Date.now() - nowOffset;
};
