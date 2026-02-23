import './web.js';
import { initBanLiftDate, initSavePnidButton } from './admin/moderate-user.js';
import { initReportButtons } from './admin/reports.js';
import { initUploadPreview } from './admin/edit-community.js';

document.addEventListener('DOMContentLoaded', function () {
	// user page
	initBanLiftDate();
	initSavePnidButton();

	// report list
	initReportButtons();

	// community page
	initUploadPreview();
});
