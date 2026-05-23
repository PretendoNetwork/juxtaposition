/*! (c) Andrea Giammarchi - ISC */
Node.prototype.contains = function contains(el) {
	return !!(el.compareDocumentPosition(this) & el.DOCUMENT_POSITION_CONTAINS);
};
