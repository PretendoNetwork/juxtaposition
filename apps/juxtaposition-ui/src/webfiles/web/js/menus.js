/* Pop-up menu component! */

/**
 * @param {Element} button
 */
export function setupPopup(button) {
	if (button.popupSetupDone) {
		return;
	}

	button.addEventListener('click', (_ev) => {
		/* Menu open */
		if (button.ariaExpanded !== 'true') {
			button.ariaExpanded = 'true';
		}
	});

	button.querySelectorAll('[role="menu"] > [role="menuitem"]').forEach((item) => {
		item.addEventListener('click', (ev) => {
			ev.stopPropagation();

			if (typeof item.cb === 'function') {
				item.cb(ev);
			}

			// Close menu
			button.ariaExpanded = 'false';
		});
	});

	/* Close on background click */
	window.addEventListener('click', (ev) => {
		if (!button.contains(ev.target)) {
			button.ariaExpanded = 'false';
		}
	}, true);

	button.popupSetupDone = true;
}

export function popupItemCb(item, cb) {
	if (item) {
		item.cb = cb;
	}
}
