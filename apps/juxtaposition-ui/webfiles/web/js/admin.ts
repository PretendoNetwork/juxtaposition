import '@/js/web.js';
import { initDatePreview, initAccountStatus, initSavePnidButton } from '@/js/admin/moderate-user.js';
import { initReportButtons } from '@/js/admin/reports.js';
import { initTitleIdControl, initUploadPreview } from '@/js/admin/edit-community.js';
import { createIslandContainer } from '@common/js/island';
import { notificationSendFormIsland } from '@/js/islands/admin/notificationSendForm';

const islands = createIslandContainer();

islands.register([
	notificationSendFormIsland
]);

document.addEventListener('DOMContentLoaded', function () {
	islands.loadBody();

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
