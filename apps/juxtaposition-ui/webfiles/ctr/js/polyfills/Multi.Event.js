window.Event = Window.prototype.Event = Document.prototype.Event = Element.prototype.Event = function Event(type, eventInitDict) {
	if (!type) {
		throw new Error('Not enough arguments');
	}
	var event;
	var bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
	var cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

	event = document.createEvent('Event');
	event.initEvent(type, bubbles, cancelable);

	return event;
};
