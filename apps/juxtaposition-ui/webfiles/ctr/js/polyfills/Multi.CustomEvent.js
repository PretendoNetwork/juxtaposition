window.CustomEvent = Window.prototype.CustomEvent = Document.prototype.CustomEvent = Element.prototype.CustomEvent = function CustomEvent(type, eventInitDict) {
	if (!type) {
		throw Error('TypeError: Failed to construct "CustomEvent": An event name must be provided.');
	}
	var event = new Event(type, eventInitDict);
	event.detail = (eventInitDict && eventInitDict.detail) || null;
	return event;
};
