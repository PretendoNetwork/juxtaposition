import { pjaxLoadUrl, PjaxRequest, PjaxError } from '../../pjax';

function message(ev: MessageEvent): void {
	var response: any;
	try {
		response = JSON.parse(ev.data);
	} catch (ignored) {
		cave.error_callFreeErrorViewer(
			5980031,
			'An error occurred. Please try again later.'
		);
		setTimeout(() => document.dispatchEvent(PjaxError), 0);
	}

	if (response.message) {
		alert(response.message);
	}

	if (response.href === '#back') {
		back();
	} else {
		pjaxLoadUrl(response.href, true, true);
	}
}

function submit(): void {
	document.dispatchEvent(PjaxRequest);
}

export function initPjaxForms(): void {
	document.querySelectorAll('[data-pjax-form]').forEach((form) => {
		form.addEventListener('submit', submit);
	});

	window.addEventListener('message', message);
}
