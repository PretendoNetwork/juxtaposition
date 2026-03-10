import { createModule } from '@repo/frontend-common';
import { GET } from '@/js/xhr';

export function checkForUpdates(): void {
	updatesModule.run({ doc: document.body });
}

// Not *really* a module, but it needs to trigger at the same times as a module
export var updatesModule = createModule({
	id: 'updates',
	init: () => {
		GET('/users/notifications.json', function updates(data) {
			var notificationObj = JSON.parse(data.responseText);
			var count =
				notificationObj.message_count + notificationObj.notification_count;
			cave.toolbar_setNotificationCount(count);
		});
	}
});

setInterval(checkForUpdates, 30000);
