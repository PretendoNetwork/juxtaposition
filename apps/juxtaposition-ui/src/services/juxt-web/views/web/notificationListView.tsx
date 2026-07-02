import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import { humanDate, humanFromNow } from '@/util';
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

		let i18nKey: TranslationKey = 'notifications.new_follower.message/one';
		if (users.length === 2) {
			i18nKey = 'notifications.new_follower.message/two';
		}
		if (users.length === 3) {
			i18nKey = 'notifications.new_follower.message/three';
		}
		if (users.length > 3) {
			i18nKey = 'notifications.new_follower.message/multiple';
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

	if (data.notif.type === 'postDeleted') {
		let i18nKey: TranslationKey = 'notifications.post_deleted.post_removed';
		if (data.notif.content.reason) {
			i18nKey = 'notifications.post_deleted.post_removed_for_reason';
		}
		if (data.notif.content.postType === 'comment') {
			i18nKey = 'notifications.post_deleted.comment_removed';
			if (data.notif.content.reason) {
				i18nKey = 'notifications.post_deleted.comment_removed_for_reason';
			}
		}
		return (
			<div className="hover">
				<a href="/titles/2551084080/new" className="icon-container notify">
					<img src="/images/bandwidthalert.png" className="icon" />
				</a>
				<a className="body" href="/titles/2551084080/new">
					<span className="text">
						<T
							k={i18nKey}
							values={{
								postId: data.notif.content.postId,
								reason: data.notif.content.reason ?? ''
							}}
						/>
						{' '}
						<T
							k="notifications.post_deleted.footer"
							values={{
								contactModsUrl: 'https://preten.do/juxt-mods/'
							}}
						/>
						<span className="timestamp">
							{' '}
							{humanFromNow(data.updatedAt)}
						</span>
					</span>
				</a>
			</div>
		);
	}

	if (data.notif.type === 'limitedFromPosting') {
		let i18nKey: TranslationKey = 'notifications.limited_from_posting.message';
		if (data.notif.content.reason) {
			i18nKey = 'notifications.limited_from_posting.message_with_reason';
		}
		if (data.notif.content.until) {
			i18nKey = 'notifications.limited_from_posting.temporary';
			if (data.notif.content.reason) {
				i18nKey = 'notifications.limited_from_posting.temporary_with_reason';
			}
		}
		return (
			<div className="hover">
				<a href="/titles/2551084080/new" className="icon-container notify">
					<img src="/images/bandwidthalert.png" className="icon" />
				</a>
				<a className="body" href="/titles/2551084080/new">
					<span className="text">
						<T
							k={i18nKey}
							values={{
								until: data.notif.content.until ? humanDate(data.notif.content.until) : '',
								reason: data.notif.content.reason ?? ''
							}}
						/>
						{' '}
						<T
							k="notifications.limited_from_posting.footer"
							values={{
								banAppealUrl: 'https://preten.do/ban-appeal/'
							}}
						/>
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
