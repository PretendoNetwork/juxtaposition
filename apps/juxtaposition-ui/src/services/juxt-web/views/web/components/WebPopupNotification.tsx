import type { ReactNode } from 'react';
import type { NotificationContent } from '@/api/generated';

export type PopupNotificationProps = {
	id: string;
	popupType: 'notification' | 'announcement';
	notification: NotificationContent;
};

export function WebPopupNotification(props: PopupNotificationProps): ReactNode {
	return (
		<div data-popup-notification={props.id} className="popup-notification">
			<p>{JSON.stringify(props.notification)}</p>
			<button data-popup-notification-close={props.popupType}>Close</button>
		</div>
	);
}
