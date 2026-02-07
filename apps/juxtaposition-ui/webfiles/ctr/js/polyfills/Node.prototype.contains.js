Node.prototype.contains = function (el) {
	while ((el = el.parentNode)) {
		if (el === this) {
			return true;
		}
	}
	return false;
};
