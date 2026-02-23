Number.isNaN = function (value) {
	return typeof value === 'number' &&
		value !== value;
};
