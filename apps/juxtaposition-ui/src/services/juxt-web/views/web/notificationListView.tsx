import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@/services/juxt-web/views/common/components/T';
import type { Notification } from '@/api/generated';

export type NotificationWrapperViewProps = {
	children?: ReactNode;
};

export type NotificationListViewProps = {
	notifications: Notification[];
};

export type NotificationItemProps = {
	notification: Notification;
};

function WebNotificationItem(props: NotificationItemProps): ReactNode {
	const url = useUrl();
	const cache = useCache();
	const notif = props.notification;
	if (notif.type === 'follow') {
		const NickName = ({ userId }: { userId: string | number | null | undefined }): ReactNode => <span className="nick-name">{userId ? cache.getUserName(Number(userId)) : null}</span>;

		let i18nKey: TranslationKey = 'notifications.new_follower/one';
		if (notif.users.length === 2) {
			i18nKey = 'notifications.new_follower/two';
		}
		if (notif.users.length === 3) {
			i18nKey = 'notifications.new_follower/three';
		}
		if (notif.users.length > 3) {
			i18nKey = 'notifications.new_follower/multiple';
		}

		return (
			<div className="hover">
				<a href={`/users/${notif.resourceId}`} className="icon-container notify">
					<img src={url.cdn(`/mii/${notif.resourceId}/normal_face.png`)} className="icon" />
				</a>
				<a className="body" href={notif.link ?? '#'}>
					<span className="text">
						<span className="link">
							<T
								k={i18nKey}
								values={{
									count: notif.users.length,
									count_other: Math.max(0, notif.users.length - 2)
								}}
								components={{
									follower_one: <NickName userId={notif.resourceId} />,
									follower_two: <NickName userId={notif.users[0]?.pid} />
								}}
							/>
						</span>
						<span className="timestamp">
							{' '}
							{moment(notif.updatedAt).fromNow()}
						</span>
					</span>
				</a>
			</div>
		);
	}

	if (notif.type === 'notice') {
		return (
			<div className="hover">
				<a href={notif.link ?? '#'} className="icon-container notify">
					<img src={notif.imageUrl} className="icon" />
				</a>
				<a className="body" href={notif.link ?? '#'}>
					<span className="text">
						{notif.content}
						<span className="timestamp">
							{' '}
							{moment(notif.updatedAt).fromNow()}
						</span>
					</span>
				</a>
			</div>
		);
	}

	return <div>Invalid notification type!</div>;
}

export function WebNotificationListView(props: NotificationListViewProps): ReactNode {
	return (
		<ul className="list-content-with-icon-and-text arrow-list" id="news-list-content">
			{props.notifications.length === 0 ? <li style={{ borderBottom: 'none' }}><p><T k="notifications.none" /></p></li> : null}
			{props.notifications.map((notification, i) => (
				<li key={i}>
					<WebNotificationItem notification={notification} />
				</li>
			))}
		</ul>
	);
}

export function WebNotificationWrapperView(props: NotificationWrapperViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				<T k="global.notifications" />
			</h2>
			<WebNavBar selection={4} />
			<div id="toast"></div>
			<WebWrapper>
				{props.children}
			</WebWrapper>
			<WebReportModalView />
		</WebRoot>
	);
}
