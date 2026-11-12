import '@/js/web.js';
import { initDatePreview, initAccountStatus, initSavePnidButton } from '@/js/admin/moderate-user.js';
import { initReportButtons } from '@/js/admin/reports.js';
import { initTitleIdControl, initUploadPreview } from '@/js/admin/edit-community.js';
import { notificationSendFormIsland } from '@/js/islands/admin/notificationSendForm';
import { islands } from '@/js/islands';

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

islands.register([
	notificationSendFormIsland
]);
