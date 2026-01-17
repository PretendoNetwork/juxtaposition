import { DateTime } from 'luxon';

function initBanLiftDate() {
	// input type datetime-local
	const picker = document.getElementById('ban_lift_date_picker');
	if (!picker) {
		return; // No date picker to init
	}

	// input type hidden
	const submission = document.getElementById('ban_lift_date');
	// span
	const utcDisplay = document.getElementById('ban_lift_date_utc');
	// span
	const durationDisplay = document.getElementById('ban_lift_date_duration');

	function updateElements(datetime) {
		picker.value = datetime.toLocal().toISO({ includeOffset: false });
		submission.value = datetime.toUTC().toISO();
		utcDisplay.innerText = datetime.toUTC().toLocaleString(DateTime.DATETIME_MED);
		durationDisplay.innerText = datetime.toRelative({
			rounding: 'expand'
		});
	}

	const initValue = submission.value;
	if (initValue) {
		const initDate = DateTime.fromISO(initValue);
		updateElements(initDate);
	}

	picker.addEventListener('change', () => {
		const newDate = DateTime.fromISO(picker.value);
		updateElements(newDate);
	});
}

function initSearchBar() {
	const userSearchNode = document.getElementById('search');
	if (userSearchNode) {
		userSearchNode.addEventListener('keyup', ({ key }) => {
			if (key === 'Enter') {
				const search = userSearchNode.value;
				const params = new URLSearchParams({ search });
				window.location.href = `/admin/accounts?${params}`;
			}
		});
	}

	const communitySearchNode = document.getElementById('search');
	if (communitySearchNode) {
		communitySearchNode.addEventListener('keyup', ({ key }) => {
			if (key === 'Enter') {
				const search = communitySearchNode.value;
				const params = new URLSearchParams({ search });
				window.location.href = `/admin/communities?${params}`;
			}
		});
	}
}

function removeReport(element) {
	const id = element.getAttribute('data-id');
	const reason = prompt('Provide explanation for removing post:');
	if (!id || !reason) {
		return;
	}

	const params = new URLSearchParams({ reason });
	fetch(`/admin/${id}?${params}`, {
		method: 'DELETE'
	})
		.then(res => res.text())
		.then(_res => location.reload());
}
window.removeReport = removeReport;

function ignoreReport(element) {
	const id = element.getAttribute('data-id');
	const reason = prompt('Provide explanation for ignoring this report:');
	if (!id || !reason) {
		return;
	}

	const params = new URLSearchParams({ reason });
	fetch(`/admin/${id}?${params}`, {
		method: 'PUT'
	})
		.then(res => res.text())
		.then(_res => location.reload());
}
window.ignoreReport = ignoreReport;

function initUploadPreview() {
	const els = document.querySelectorAll('*[data-image-preview]');
	els.forEach((el) => {
		el.addEventListener('change', () => {
			const [file] = el.files;
			const id = el.id;
			const previews = document.querySelectorAll(`*[data-image-preview-for="${id}"]`);
			previews.forEach((previewEl) => {
				if (file) {
					previewEl.src = URL.createObjectURL(file);
				}
			});
		});
	});
}

function savePNID(pid) {
	const account_status = document.getElementById('account_status');
	const ban_lift_date = document.getElementById('ban_lift_date');
	const ban_reason = document.getElementById('ban_reason');
	fetch(`/admin/accounts/${pid}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			account_status: Number(account_status.value),
			ban_lift_date: ban_lift_date.value,
			ban_reason: ban_reason.value
		})
	})
		.then(response => response.json())
		.then(({ error }) => {
			if (!error) {
				alert('Juxt user data saved');
			}
		})
		.catch(console.log);
}
window.savePNID = savePNID;

document.addEventListener('DOMContentLoaded', function () {
	initSearchBar();
	initBanLiftDate();
	initUploadPreview();
});
