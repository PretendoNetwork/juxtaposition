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
	const node = document.getElementById('search');
	if (!node) {
		return; // No searchbar to init
	}

	node.addEventListener('keyup', ({ key }) => {
		if (key === 'Enter') {
			const search = node.value;
			window.location.href = `/admin/accounts?search=${search}`;
		}
	});
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
		.then(res => location.reload());
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
		.then(res => location.reload());
}
window.ignoreReport = ignoreReport;

document.addEventListener('DOMContentLoaded', function () {
	initSearchBar();
	initBanLiftDate();
});
