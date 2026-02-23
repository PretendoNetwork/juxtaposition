import './web.js';
import { initBanLiftDate, initSavePnidButton } from './admin/moderate-user.js';

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

document.addEventListener('DOMContentLoaded', function () {
	initBanLiftDate();
	initSavePnidButton();
	initUploadPreview();
});
