Object.create = function (proto, propertiesObject) {
	if (typeof proto !== 'object' && typeof proto !== 'function') {
		throw new TypeError('Object prototype may only be an Object: ' + proto);
	} else if (proto === null || typeof propertiesObject != 'undefined') {
		throw new Error('This browser\'s implementation of Object.create is a shim and doesn\'t support \'null\' as the first argument, nor a second argument.');
	}

	function F() {}
	F.prototype = proto;

	return new F();
};
