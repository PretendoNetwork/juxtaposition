import './web.js';
import { initDatePreview, initAccountStatus, initSavePnidButton } from './admin/moderate-user.js';
import { initReportButtons } from './admin/reports.js';
import { initTitleIdControl, initUploadPreview } from './admin/edit-community.js';

document.addEventListener('DOMContentLoaded', function () {
	// user page
	initDatePreview();
	initAccountStatus();
	initSavePnidButton();

	// report list
	initReportButtons();

	// community page
	initUploadPreview();
	initTitleIdControl();
});
