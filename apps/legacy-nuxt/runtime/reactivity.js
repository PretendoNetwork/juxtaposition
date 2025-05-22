// TODO - Replace this with something more robust, like a 3rd party sanitizer
function escapeHTML(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

// * Polyfills. o3DS browser is missing these and is our "lowest" target
// TODO - Put these in own file
if (typeof String.prototype.startsWith !== 'function') {
	String.prototype.startsWith = function(prefix) {
		return this.indexOf(prefix) === 0;
	};
}

if (typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

if (typeof NodeList.prototype.forEach !== 'function') {
	NodeList.prototype.forEach = function(callbackfn, thisArg) {
		[].forEach.call(this, callbackfn, thisArg);
	};
}

window.g_state = {};

if (typeof window.getRefValue !== 'function') {
	window.getRefValue = function(refName) {
		return window.g_state[refName];
	};
}

if (typeof window.setRefValue !== 'function') {
	window.setRefValue = function(refName, value) {
		window.g_state[refName] = value;
		window.updateUI();
	};
}

if (typeof window.createEventHandlerFn !== 'function') {
	window.createEventHandlerFn = function(handlerStr) {
		return function(event) {
			try {
				const handlerArgs = handlerStr.split(':');
				const eventName = handlerArgs[0];

				// * Handle events like `@click="refName++"`
				if (eventName == 'increment') {
					window.g_state[handlerArgs[1]]++;
					window.updateUI();

					return false;
				}

				// * Handle events like `@click="refName--"`
				if (eventName == 'decrement') {
					window.g_state[handlerArgs[1]]--;
					window.updateUI();

					return false;
				}

				// * Handle events like `@click="someFunction('arg1', 'arg2', 'etc')"`
				// * Also supports events like `@click="someFunction"`
				if (eventName == 'call') {
					const functionName = handlerArgs[1];
					const argsString = handlerArgs.length > 2 ? handlerArgs.slice(2).join(':') : '';
					const args = [];

					if (argsString && argsString.length > 0) {
						if ((argsString.startsWith("'") && argsString.endsWith("'")) || (argsString.startsWith('"') && argsString.endsWith('"'))) {
							args.push(argsString.substring(1, argsString.length - 1));
						} else if (!isNaN(parseFloat(argsString)) && isFinite(argsString)) {
							args.push(parseFloat(argsString));
						} else if (argsString === 'true') {
							args.push(true);
						} else if (argsString === 'false') {
							args.push(false);
						} else {
							args.push(argsString);
						}
					}

					if (typeof window[functionName] === 'function') {
						window[functionName].apply(null, args);
						window.updateUI();
					}

					return false;
				}

				// * Handle events like `@click="refName='new value'"`
				if (eventName == 'assign') {
					const refName = handlerArgs[1];
					const valueStr = handlerArgs.slice(2).join(':');
					var newValue;

					// * Check new value structure, in order:
					// * - "New String Value"
					// * - 'New String Value'
					// * - Booleans
					// * - Numbers
					if ((valueStr.startsWith("'") && valueStr.endsWith("'")) || (valueStr.startsWith('"') && valueStr.endsWith('"'))) {
						newValue = valueStr.substring(1, valueStr.length - 1);
					} else if (valueStr === 'true') {
						newValue = true;
					} else if (valueStr === 'false') {
						newValue = false;
					} else {
						const num = parseFloat(valueStr);
						newValue = !isNaN(num) ? num : valueStr;
					}

					window.g_state[refName] = newValue;
					window.updateUI();

					return false;
				}

				if (typeof window[handlerStr] === 'function') {
					window[handlerStr].call(null, event);
					window.updateUI();

					return false;
				}
			} catch (error) {
				alert('Error in event handler:', error.message, 'for handler:', handlerStr);
			}

			return false;
		};
	};
}

if (typeof window.updateUI !== 'function') {
	window.updateUI = function() {
		try {
			// * Update one-way binds (`<p>{{ someRef }}</p>`)
			document.querySelectorAll('[data-bind]').forEach(function(el) {
				const refName = el.getAttribute('data-bind');

				// * Support route parameters passed from the path name
				if (refName.startsWith('route.params.')) {
					const paramName = refName.substring('route.params.'.length);
					if (window.route && window.route.params && window.route.params[paramName] !== undefined) {
						el.innerHTML = escapeHTML(String(window.route.params[paramName]));
					}
				} else if (window.g_state[refName] !== undefined) {
					el.innerHTML = escapeHTML(String(window.g_state[refName]));
				} else {
					el.innerHTML = '';
				}
			});

			// * Update two-way binds (`<input v-model="someRef">`)
			document.querySelectorAll('[data-model]').forEach(function(el) {
				const refName = el.getAttribute('data-model');

				if (window.g_state[refName] !== undefined && el.value !== window.g_state[refName]) {
					el.value = window.g_state[refName];
				}
			});

			// * Update class ref binds (`<div :class="someRef">`)
			document.querySelectorAll('[data-class-binding]').forEach(function(el) {
				const refName = el.getAttribute('data-class-binding');
				const originalClass = el.getAttribute('data-original-class') || '';
				const dynamicClassName = window.g_state[refName];

				// * Preserve the original class list if exists
				if (dynamicClassName !== undefined) {
					el.className = originalClass + (originalClass && dynamicClassName ? ' ' : '') + dynamicClassName;
				} else if (originalClass) {
					el.className = originalClass;
				} else {
					el.className = '';
				}
			});
		} catch (error) {
			alert('Error updating UI:', error);
		}
	};
}

function initializePageEventListeners() {
	window.updateUI();

	document.querySelectorAll('[data-model]').forEach(function(el) {
		// * Set the initial two-way bind in the html using the
		// * refs default value
		const refName = el.getAttribute('data-model');
		if (el.value === '' && window.g_state[refName] !== undefined) {
			el.value = window.g_state[refName];
		}

		// * Update the two-way bind value when the element
		// * value changes
		el.onchange = function() {
			const refName = this.getAttribute('data-model');
			var val = this.value;

			if (typeof window.g_state[refName] === 'number') {
				const numVal = parseFloat(val);
				if (!isNaN(numVal)) {
					val = numVal;
				}
			}

			window.g_state[refName] = val;
			window.updateUI();
		};

		// * 3DS has needs to be polled, because it does
		// * not trigger any events we can reliably hook
		// * to detect input element text changes in real
		// * time. We only get the events after the input
		// * element loses focus, not when the keyboard
		// * closes
		// TODO - Check if the same issue happens on Wii U
		//        and if so, make this polling only happen
		//        on the 3DS
		setInterval((function(element, refName) {
			var lastValue = element.value;
			return function() {
				// * Only update if the value actually changed
				if (element.value !== lastValue) {
					lastValue = element.value;
					var val = element.value;

					if (typeof window.g_state[refName] === 'number') {
						const numVal = parseFloat(val);
						if (!isNaN(numVal)) {
							val = numVal;
						}
					}

					window.g_state[refName] = val;
					window.updateUI();
				}
			};
		})(el, refName), 100); // TODO - Is this too fast?
	});

	// * Setup DOM events on each element
	document.querySelectorAll('[data-on]').forEach(function(el) {
		const eventName = el.getAttribute('data-on');
		const handler = el.getAttribute('data-handler');

		el['on' + eventName] = window.createEventHandlerFn(handler);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializePageEventListeners);
} else {
	initializePageEventListeners();
}