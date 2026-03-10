import { DateTime } from 'luxon';
import type { DateTimeMaybeValid } from 'luxon';

export function initBanLiftDate(): void {
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

function savePNID(this: HTMLButtonElement, _ev: Event): void {
	const pid = this.getAttribute('data-button-admin-save-pnid')!;
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

export function initSavePnidButton(): void {
	document.querySelectorAll('[data-button-admin-save-pnid]').forEach((el) => {
		el.addEventListener('click', savePNID);
	});
}
