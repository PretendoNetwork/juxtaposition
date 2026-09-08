import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import { humanDate, humanFromNow } from '@/util';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@/services/juxt-web/views/common/components/T';
import type { EmpathyNotification, FollowNotification, LimitedFromPostingNotification, Notification, PostDeletedNotification, ReplyNotification, ShallowUser, SystemNotification } from '@/api/generated';

export type NotificationWrapperViewProps = {
	children?: ReactNode;
};

export type NotificationListViewProps = {
	notifications: Notification[];
};

export type NotificationItemProps = {
	notification: Notification;
};

export type NotificationItemTypeProps<T> = {
	data: Notification;
	notif: T;
};

function FollowNotificationView(props: NotificationItemTypeProps<FollowNotification>): ReactNode {
	const url = useUrl();
	const NickName = ({ user }: { user: ShallowUser | null | undefined }): ReactNode => <span className="nick-name">{user?.miiName ?? 'Nobody'}</span>;
	const users = [...props.notif.content.users].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
								follower_one: <NickName user={users[0]?.user} />,
								follower_two: <NickName user={users[1]?.user} />
							}}
						/>
					</span>
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</span>
			</a>
		</div>
	);
}

function EmpathyNotificationView(props: NotificationItemTypeProps<EmpathyNotification>): ReactNode {
	const url = useUrl();
	const NickName = ({ user }: { user: ShallowUser | null | undefined }): ReactNode => <span className="nick-name">{user?.miiName ?? 'Nobody'}</span>;
	const users = [...props.notif.content.users].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	const latestUser = users[0];
	const yeahedPost = props.notif.content.postId;

	let i18nKey: TranslationKey = 'notifications.new_empathy.message/one';
	if (users.length === 2) {
		i18nKey = 'notifications.new_empathy.message/two';
	}
	if (users.length === 3) {
		i18nKey = 'notifications.new_empathy.message/three';
	}
	if (users.length > 3) {
		i18nKey = 'notifications.new_empathy.message/multiple';
	}

	return (
		<div className="hover">
			<a href={`/posts/${yeahedPost}`} className="icon-container notify">
				<img src={url.cdn(`/mii/${latestUser.pid}/normal_face.png`)} className="icon" />
			</a>
			<a className="body" href={`/posts/${yeahedPost}`}>
				<span className="text">
					<span className="link">
						<T
							k={i18nKey}
							values={{
								count: users.length,
								count_other: Math.max(0, users.length - 2)
							}}
							components={{
								empathy_one: <NickName user={users[0]?.user} />,
								empathy_two: <NickName user={users[1]?.user} />
							}}
						/>
					</span>
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</span>
			</a>
		</div>
	);
}

function ReplyNotificationView(props: NotificationItemTypeProps<ReplyNotification>): ReactNode {
	const url = useUrl();
	const NickName = ({ user }: { user: ShallowUser | null | undefined }): ReactNode => <span className="nick-name">{user?.miiName ?? 'Nobody'}</span>;
	const { pid, user, parent } = props.notif.content;

	const i18nKey: TranslationKey = 'notifications.new_reply';

	return (
		<div className="hover">
			<a href={`/posts/${parent}`} className="icon-container notify">
				<img src={url.cdn(`/mii/${pid}/normal_face.png`)} className="icon" />
			</a>
			<a className="body" href={`/posts/${parent}`}>
				<span className="text">
					<span className="link">
						<T
							k={i18nKey}
							components={{
								reply_author: <NickName user={user} />
							}}
						/>
					</span>
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</span>
			</a>
		</div>
	);
}

function PostDeletedNotificationView(props: NotificationItemTypeProps<PostDeletedNotification>): ReactNode {
	let i18nKey: TranslationKey = 'notifications.post_deleted.post_removed';
	if (props.notif.content.reason) {
		i18nKey = 'notifications.post_deleted.post_removed_for_reason';
	}
	if (props.notif.content.postType === 'comment') {
		i18nKey = 'notifications.post_deleted.comment_removed';
		if (props.notif.content.reason) {
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
							postId: props.notif.content.postId,
							reason: props.notif.content.reason ?? ''
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
						{humanFromNow(props.data.updatedAt)}
					</span>
				</span>
			</a>
		</div>
	);
}

function LimitedFromPostingNotificationView(props: NotificationItemTypeProps<LimitedFromPostingNotification>): ReactNode {
	let i18nKey: TranslationKey = 'notifications.limited_from_posting.message';
	if (props.notif.content.reason) {
		i18nKey = 'notifications.limited_from_posting.message_with_reason';
	}
	if (props.notif.content.until) {
		i18nKey = 'notifications.limited_from_posting.temporary';
		if (props.notif.content.reason) {
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
							until: props.notif.content.until ? humanDate(props.notif.content.until) : '',
							reason: props.notif.content.reason ?? ''
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
						{humanFromNow(props.data.updatedAt)}
					</span>
				</span>
			</a>
		</div>
	);
}

function SystemNotificationView(props: NotificationItemTypeProps<SystemNotification>): ReactNode {
	return (
		<div className="hover">
			<a href={props.notif.content.link} className="icon-container notify">
				<img src={props.notif.content.imagePath} className="icon" />
			</a>
			<a className="body" href={props.notif.content.link}>
				<span className="text">
					{props.notif.content.text}
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</span>
			</a>
		</div>
	);
}

function WebNotificationItem(props: NotificationItemProps): ReactNode {
	const notif = props.notification.notif;
	if (notif.type === 'follow') {
		return <FollowNotificationView data={props.notification} notif={notif} />;
	}

	if (notif.type == 'empathy') {
		return <EmpathyNotificationView data={props.notification} notif={notif} />;
	}

	if (notif.type === 'reply') {
		return <ReplyNotificationView data={props.notification} notif={notif} />;
	}

	if (notif.type === 'postDeleted') {
		return <PostDeletedNotificationView data={props.notification} notif={notif} />;
	}

	if (notif.type === 'limitedFromPosting') {
		return <LimitedFromPostingNotificationView data={props.notification} notif={notif} />;
	}

	if (notif.type === 'system') {
		return <SystemNotificationView data={props.notification} notif={notif} />;
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
