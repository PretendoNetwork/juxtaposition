import { Toast } from './toast';
import { POST } from './xhr';

export function initReportForm() {
	const modal = document.getElementById('report-form-modal');
	if (!modal || modal.setupDone) {
		return;
	}

	const cancel = modal.querySelector('#report-cancel-button');
	cancel.addEventListener('click', (_ev) => {
		modal.hidden = true;
	});

	const form = modal.querySelector('form');
	form.addEventListener('submit', (ev) => {
		ev.preventDefault();

		const formData = new FormData(form);
		const params = new URLSearchParams();
		for (const [key, value] of formData.entries()) {
			params.append(key, value);
		}

		POST(form.action, params.toString(), (request) => {
			if (request.status !== 200) {
				Toast('Unable to submit report. Please try again later.');
				return;
			}
			Toast('Report submitted.');
			modal.hidden = true;
		});
	});

	modal.setupDone = true;
}

export function reportPost(id) {
	const modal = document.getElementById('report-form-modal');
	const form = modal.querySelector('form');
	const formID = modal.querySelector('#report-post-id');
	if (!id || !form || !formID) {
		return;
	}

	form.action = `/posts/${id}/report?api=true`;
	formID.value = id;

	modal.hidden = false;
	form.reset();
}
