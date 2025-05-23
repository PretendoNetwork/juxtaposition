export function initReportForm() {
	const modal = document.getElementById('report-form-modal');
	if (modal.setupDone) {
		return;
	}

	const cancel = modal.querySelector('#report-cancel-button');
	cancel.addEventListener('click', (_ev) => {
		modal.hidden = true;
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

	form.action = `/posts/${id}/report`;
	formID.value = id;

	modal.hidden = false;
}
