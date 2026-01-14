var	lastTime = Date.now();
window.requestAnimationFrame = function (callback) {
	if (typeof callback !== 'function') {
		throw new TypeError(callback + 'is not a function');
	}

	var	currentTime = Date.now();
	var delay = 16 + lastTime - currentTime;

	if (delay < 0) {
		delay = 0;
	}

	lastTime = currentTime;

	return setTimeout(function () {
		lastTime = Date.now();

		callback(performance.now());
	}, delay);
};

window.cancelAnimationFrame = function (id) {
	clearTimeout(id);
};
