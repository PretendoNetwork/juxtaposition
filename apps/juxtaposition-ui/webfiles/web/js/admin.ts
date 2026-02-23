import './web.js';
import { initBanLiftDate, initSavePnidButton } from './admin/moderate-user.js';
import { initReportButtons } from './admin/reports.js';

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
	// user page
	initBanLiftDate();
	initSavePnidButton();

	// report list
	initReportButtons();

	// community page
	initUploadPreview();
});
