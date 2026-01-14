Object.defineProperty(Object, 'assign', {
	value: function assign(target, _varArgs) { // .length of function is 2
		'use strict';
		if (target === null || target === undefined) {
			throw new TypeError('Cannot convert undefined or null to object');
		}

		var to = Object(target);

		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];

			if (nextSource !== null && nextSource !== undefined) {
				for (var nextKey in nextSource) {
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	},
	writable: true,
	configurable: true
});
