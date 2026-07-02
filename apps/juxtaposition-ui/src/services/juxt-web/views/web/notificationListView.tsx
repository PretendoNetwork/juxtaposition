import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import { humanFromNow } from '@/util';
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
	const data = props.notification;
	if (data.notif.type === 'follow') {
		const NickName = ({ userId }: { userId: string | number | null | undefined }): ReactNode => <span className="nick-name">{userId ? cache.getUserName(Number(userId)) : null}</span>;
		const users = [...data.notif.content.users].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
		const latestUser = users[0];

		let i18nKey: TranslationKey = 'notifications.new_follower/one';
		if (users.length === 2) {
			i18nKey = 'notifications.new_follower/two';
		}
		if (users.length === 3) {
			i18nKey = 'notifications.new_follower/three';
		}
		if (users.length > 3) {
			i18nKey = 'notifications.new_follower/multiple';
		}

		return (
			<div className="hover">
				<a href={`/users/${latestUser.pid}`} className="icon-container notify">
					<img src={url.cdn(`/mii/${latestUser.pid}/normal_face.png`)} className="icon" />
				</a>
				<a className="body" href={`/users/${latestUser.pid}`}>
					<span className="text">
						<span className="link">
							<T
								k={i18nKey}
								values={{
									count: users.length,
									count_other: Math.max(0, users.length - 2)
								}}
								components={{
									follower_one: <NickName userId={users[0]?.pid} />,
									follower_two: <NickName userId={users[1]?.pid} />
								}}
							/>
						</span>
						<span className="timestamp">
							{' '}
							{humanFromNow(data.updatedAt)}
						</span>
					</span>
				</a>
			</div>
		);
	}

	if (data.notif.type === 'system') {
		return (
			<div className="hover">
				<a href={data.notif.content.link} className="icon-container notify">
					<img src={data.notif.content.imagePath} className="icon" />
				</a>
				<a className="body" href={data.notif.content.link}>
					<span className="text">
						{data.notif.content.text}
						<span className="timestamp">
							{' '}
							{humanFromNow(data.updatedAt)}
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
