var ERR_VALUE_ACCESSORS = 'A property cannot both have accessors and be writable or have a value';

// Polyfill.io - This does not use CreateMethodProperty because our CreateMethodProperty function uses Object.defineProperty.
Object.defineProperty = function defineProperty(object, property, descriptor) {
	if (object === null || !(object instanceof Object || typeof object === 'object')) {
		throw new TypeError('Object.defineProperty called on non-object');
	}

	if (!(descriptor instanceof Object)) {
		throw new TypeError('Property description must be an object');
	}

	var propertyString = String(property);
	var hasValueOrWritable = 'value' in descriptor || 'writable' in descriptor;
	var getterType = 'get' in descriptor && typeof descriptor.get;
	var setterType = 'set' in descriptor && typeof descriptor.set;

	// handle descriptor.get
	if (getterType) {
		if (getterType !== 'function') {
			throw new TypeError('Getter must be a function');
		}
		if (hasValueOrWritable) {
			throw new TypeError(ERR_VALUE_ACCESSORS);
		}
		Object.__defineGetter__.call(object, propertyString, descriptor.get);
	} else {
		object[propertyString] = descriptor.value;
	}

	// handle descriptor.set
	if (setterType) {
		if (setterType !== 'function') {
			throw new TypeError('Setter must be a function');
		}
		if (hasValueOrWritable) {
			throw new TypeError(ERR_VALUE_ACCESSORS);
		}
		Object.__defineSetter__.call(object, propertyString, descriptor.set);
	}

	// OK to define value unconditionally - if a getter has been specified as well, an error would be thrown above
	if ('value' in descriptor) {
		object[propertyString] = descriptor.value;
	}

	return object;
};
