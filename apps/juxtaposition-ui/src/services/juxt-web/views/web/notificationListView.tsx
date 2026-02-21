import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { NotificationSchema } from '@/models/notifications';

export type NotificationWrapperViewProps = {
	selectedTab: number;
	children?: ReactNode;
};

export type NotificationListViewProps = {
	notifications: InferSchemaType<typeof NotificationSchema>[];
};

export type NotificationItemProps = {
	notification: InferSchemaType<typeof NotificationSchema>;
};

function WebNotificationItem(props: NotificationItemProps): ReactNode {
	const url = useUrl();
	const cache = useCache();
	const notif = props.notification;
	if (notif.type === 'follow') {
		const NickName = ({ userId }: { userId: string | number | null | undefined }): ReactNode => <span className="nick-name">{userId ? cache.getUserName(Number(userId)) : null}</span>;
		return (
			<div className="hover">
				<a href={`/users/${notif.objectID}`} className="icon-container notify">
					<img src={url.cdn(`/mii/${notif.objectID}/normal_face.png`)} className="icon" />
				</a>
				<a className="body" href={notif.link ?? '#'}>
					<span className="text">
						{notif.users.length === 1
							? <NickName userId={notif.objectID} />
							: notif.users.length === 2
								? (
										<>
											<NickName userId={notif.objectID} />
											<span>
												and
												{' '}
												<NickName userId={notif.users[0].user} />
											</span>
										</>
									)
								: (
										<>
											<NickName userId={notif.objectID} />
											{', '}
											<NickName userId={notif.users[0].user} />
											{', '}
											<span>
												and
												{' '}
												<span className="nick-name">
													{notif.users.length - 2}
													{' '}
													other(s)
												</span>
											</span>
										</>
									)}
						<span className="link">{props.ctx.lang.notifications.new_follower}</span>
						<span className="timestamp">
							{' '}
							{moment(notif.lastUpdated).fromNow()}
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
					<img src={notif.image ?? undefined} className="icon" />
				</a>
				<a className="body" href={notif.link ?? '#'}>
					<span className="text">
						{notif.text}
						<span className="timestamp">
							{' '}
							{moment(notif.lastUpdated).fromNow()}
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
			{props.notifications.length === 0 ? <li style={{ borderBottom: 'none' }}><p>{props.ctx.lang.notifications.none}</p></li> : null}
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
				{props.ctx.lang.global.notifications}
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
