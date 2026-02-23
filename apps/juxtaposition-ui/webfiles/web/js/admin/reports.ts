function removeReport(this: HTMLElement, _ev: Event): void {
	const id = this.getAttribute('data-button-admin-remove-report');
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

function ignoreReport(this: HTMLElement, _ev: Event): void {
	const id = this.getAttribute('data-button-admin-ignore-report');
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

export function initReportButtons(): void {
	document.querySelectorAll('[data-button-admin-remove-report]').forEach((el) => {
		el.addEventListener('click', removeReport);
	});

	document.querySelectorAll('[data-button-admin-ignore-report]').forEach((el) => {
		el.addEventListener('click', ignoreReport);
	});
}
