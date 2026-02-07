Function.prototype.bind = function () {
	var slice = Array.prototype.slice;
	var thatFunc = this;
	var thatArg = arguments[0];
	var args = slice.call(arguments, 1);
	if (typeof thatFunc !== 'function') {
		throw new TypeError('Function.prototype.bind - ' +
			'what is trying to be bound is not callable');
	}
	return function () {
		var funcArgs = args.concat(slice.call(arguments));
		return thatFunc.apply(thatArg, funcArgs);
	};
};
