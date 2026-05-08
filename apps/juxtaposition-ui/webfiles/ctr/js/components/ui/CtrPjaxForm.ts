import { pjaxLoadUrl, pjaxBack } from '../../pjax';

function message(ev: MessageEvent): void {
	var response: any;
	try {
		response = JSON.parse(ev.data);
	} catch (ignored) {
		cave.error_callFreeErrorViewer(
			5980031,
			'An error occurred. Please try again later.'
		);
		cave.transition_end();
		return;
	}

	if (response.message) {
		alert(response.message);
	}

	if (response.href === '#back') {
		pjaxBack();
	} else {
		pjaxLoadUrl(response.href, true, true);
	}
}

function submit(): void {
	cave.transition_begin();
}

export function initPjaxForms(): void {
	document.querySelectorAll('[data-pjax-form]').forEach((form) => {
		form.addEventListener('submit', submit);
	});

	window.addEventListener('message', message);
}
