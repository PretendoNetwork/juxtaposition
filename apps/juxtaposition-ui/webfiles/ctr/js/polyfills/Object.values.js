Object.values = function (obj) {
	var values = [];

	for (var i in obj) {
		// eslint-disable-next-line no-prototype-builtins -- polyfill
		if (obj.hasOwnProperty(i)) {
			values.push(obj[i]);
		}
	}

	return values;
};
