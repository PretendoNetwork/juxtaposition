import type { ReactNode } from 'react';
import type { NotificationContent, SystemNotification } from '@/api/generated';

export type PopupNotificationProps = {
	id: string;
	popupType: 'notification' | 'announcement';
	notification: NotificationContent;
};

export type PopupNotificationItemTypeProps<T> = {
	notif: T;
};

function SystemPopupView(props: PopupNotificationItemTypeProps<SystemNotification>): ReactNode {
	return (
		<div>
			<div className="popup-card-content">
				<p>{props.notif.content.text}</p>
			</div>
		</div>
	);
}

export function WebPopupNotificationItemView(props: PopupNotificationProps): ReactNode {
	const notif = props.notification;
	if (notif.type === 'system') {
		return <SystemPopupView notif={notif} />;
	}

	return <div>Invalid popup type!</div>;
}

export function WebPopupNotification(props: PopupNotificationProps): ReactNode {
	return (
		<div data-popup-notification={props.id} className="popup-notification">
			<div className="popup-screen">
				<div className="popup-screen">
					<div className="popup-content">
						<div className="popup-card">
							<WebPopupNotificationItemView {...props} />
							<div className="popup-action-list">
								<button className="popup-action" data-popup-notification-close={props.popupType}>Continue</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
