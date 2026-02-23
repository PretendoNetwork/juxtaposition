import './web.js';
import { DateTime } from 'luxon';
import type { DateTimeMaybeValid } from 'luxon';

function initBanLiftDate(): void {
	// input type datetime-local
	const picker = document.getElementById('ban_lift_date_picker') as HTMLInputElement;
	if (!picker) {
		return; // No date picker to init
	}

	// input type hidden
	const submission = document.getElementById('ban_lift_date') as HTMLInputElement;
	// span
	const utcDisplay = document.getElementById('ban_lift_date_utc')!;
	// span
	const durationDisplay = document.getElementById('ban_lift_date_duration')!;

	function updateElements(datetime: DateTimeMaybeValid): void {
		picker.value = datetime.toLocal().toISO({ includeOffset: false }) ?? '';
		submission.value = datetime.toUTC().toISO() ?? '';
		utcDisplay.innerText = datetime.toUTC().toLocaleString(DateTime.DATETIME_MED);
		durationDisplay.innerText = datetime.toRelative({
			rounding: 'expand'
		}) ?? '';
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

function initSearchBar(): void {
	const userSearchNode = document.getElementById('user-search') as HTMLInputElement;
	if (userSearchNode) {
		userSearchNode.addEventListener('keyup', ({ key }) => {
			if (key === 'Enter') {
				const search = userSearchNode.value;
				const params = new URLSearchParams({ search });
				window.location.href = `/admin/accounts?${params}`;
			}
		});
	}

	const communitySearchNode = document.getElementById('community-search') as HTMLInputElement;
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

function removeReport(element: HTMLElement): void {
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
// @ts-expect-error window hack
window.removeReport = removeReport;

function ignoreReport(element: HTMLElement): void {
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
// @ts-expect-error window hack
window.ignoreReport = ignoreReport;

function initUploadPreview(): void {
	const els = document.querySelectorAll('*[data-image-preview]') as NodeListOf<HTMLInputElement>;
	els.forEach((el) => {
		el.addEventListener('change', () => {
			const [file] = el.files!;
			const id = el.id;
			const previews = document.querySelectorAll(`*[data-image-preview-for="${id}"]`) as NodeListOf<HTMLImageElement>;
			previews.forEach((previewEl) => {
				if (file) {
					previewEl.src = URL.createObjectURL(file);
				}
			});
		});
	});
}

function savePNID(pid: number): void {
	const account_status = document.getElementById('account_status') as HTMLInputElement;
	const ban_lift_date = document.getElementById('ban_lift_date') as HTMLInputElement;
	const ban_reason = document.getElementById('ban_reason') as HTMLInputElement;
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
// @ts-expect-error window hack
window.savePNID = savePNID;

document.addEventListener('DOMContentLoaded', function () {
	initSearchBar();
	initBanLiftDate();
	initUploadPreview();
});
