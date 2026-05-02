import { DateTime } from 'luxon';

export function initAccountStatus(): void {
	const hidableElements = document.querySelectorAll<HTMLElement>('[data-show-when-status]');
	const statusPicker = document.querySelectorAll<HTMLSelectElement>('select[data-account-status-editor]');

	function applyStatusView(status: string | null): void {
		hidableElements.forEach((el) => {
			if (status && el.getAttribute('data-show-when-status') === status) {
				el.style.display = 'block';
			} else {
				el.style.display = 'none';
			}
		});
	}

	statusPicker.forEach((el) => {
		el.addEventListener('change', () => {
			applyStatusView(el.value);
		});

		// Initial state
		applyStatusView(el.value);
	});
}

export function initDatePreview(): void {
	const previewElements = document.querySelectorAll<HTMLElement>('[data-date-preview-for]');
	const datePickers = document.querySelectorAll<HTMLInputElement>('input[data-date-picker-preview]');

	function applyDatePreview(id: string): void {
		previewElements.forEach((el) => {
			if (el.getAttribute('data-date-preview-for') !== id) {
				return;
			}

			// Apply preview
			const input = document.getElementById(id) as HTMLInputElement | null;
			if (!input) {
				return;
			}

			if (!input.value) {
				el.style.display = 'none';
				return;
			}

			el.style.display = 'flex';
			const datetime = DateTime.fromISO(input.value);
			const utcEls = el.querySelectorAll<HTMLElement>('[data-date-preview-utc]');
			const untilEls = el.querySelectorAll<HTMLElement>('[data-date-preview-until]');
			utcEls.forEach(utcEl => utcEl.innerText = datetime.toUTC().toLocaleString(DateTime.DATETIME_MED));
			untilEls.forEach(untilEl => untilEl.innerText = datetime.toRelative({
				rounding: 'expand'
			}) ?? '');
		});
	}

	datePickers.forEach((el) => {
		el.addEventListener('change', () => {
			applyDatePreview(el.id);
		});

		// Initial state
		const initialDate = el.getAttribute('data-init-date-value');
		if (initialDate) {
			const parsedDate = DateTime.fromISO(initialDate);
			el.value = parsedDate.toLocal().toISO({ includeOffset: false }) ?? '';
		}
		applyDatePreview(el.id);
	});
}

function savePNID(form: HTMLFormElement): void {
	const formData = new FormData(form);
	const pid = form.getAttribute('data-pnid-save-form')!;

	const account_status = formData.get('account_status');
	const ban_lift_date = formData.get('ban_lift_date');
	const ban_reason = formData.get('ban_reason');
	fetch(`/admin/accounts/${pid}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			account_status: account_status ? Number(account_status) : undefined,
			ban_lift_date: ban_lift_date ? new Date(ban_lift_date.toString()) : null,
			ban_reason: ban_reason
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
	const els = document.querySelectorAll<HTMLFormElement>('form[data-pnid-save-form]');

	els.forEach((el) => {
		el.addEventListener('submit', (evt) => {
			evt.preventDefault();
			savePNID(el);
		});
	});
}
