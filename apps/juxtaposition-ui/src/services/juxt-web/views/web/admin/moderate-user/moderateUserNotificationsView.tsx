import { WebNotificationItem } from '@/services/juxt-web/views/web/notificationListView';
import { humanDate } from '@/util';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import type { ReactNode } from 'react';
import type { Notification } from '@/api/generated';

export type ModerateUserNotificationsListViewProps = {
	userPid: number;
	notifications: Notification[];
};

type ModerateUserNotificationProps = {
	notification: Notification;
};

function ModerateUserNotificationView({ notification }: ModerateUserNotificationProps): ReactNode {
	return (
		<div>
			<p>{humanDate(notification.updatedAt)} - {notification.hasRead ? 'Read' : 'Unread'}</p>
			<li>
				<WebNotificationItem notification={notification} />
			</li>
		</div>
	);
}

function WebNotificationSendForm(props: { pid: number }): ReactNode {
	return (
		<div className="notification-send-form">
			<div className="header">
				<h4 className="header-title">Send notification</h4>
			</div>
			<form data-notification-send-form={props.pid}>
				<div className="content">
					<div className="field">
						<label>Message</label>
						<input type="text" name="text" placeholder="Lorem ipsum..." />
					</div>
				</div>
				<div className="footer">
					<button className="footer-button" type="submit">Send notification</button>
				</div>
			</form>
		</div>
	);
}

export function ModerateUserNotificationsListView(props: ModerateUserNotificationsListViewProps): ReactNode {
	const user = useUser();

	return (
		<div>
			{user.perms.developer ? <WebNotificationSendForm pid={props.userPid} /> : null}
			<h4>{props.notifications.length}/50 sent notifications</h4>
			<ul className="list-content-with-icon-and-text arrow-list">
				{props.notifications.length === 0 ? <p>There's nothing here...</p> : null}
				{props.notifications.map(val => <ModerateUserNotificationView key={val.id} notification={val} />) }
			</ul>
		</div>
	);
}
