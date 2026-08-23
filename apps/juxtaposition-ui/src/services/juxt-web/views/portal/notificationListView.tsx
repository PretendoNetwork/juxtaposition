import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/components/PortalNavBar';
import { humanDate, humanFromNow } from '@/util';
import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalMiiIcon } from '@/services/juxt-web/views/portal/components/ui/PortalMiiIcon';
import { PortalIcon } from '@/services/juxt-web/views/portal/components/ui/PortalIcon';
import { PortalListView, PortalListViewItem } from '@/services/juxt-web/views/portal/components/PortalListView';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@/services/juxt-web/views/common/components/T';
import type { NotificationItemProps, NotificationItemTypeProps, NotificationListViewProps, NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';
import type { EmpathyNotification, FollowNotification, LimitedFromPostingNotification, PostDeletedNotification, ReplyNotification, ShallowUser, SystemNotification } from '@/api/generated';

function FollowNotificationView(props: NotificationItemTypeProps<FollowNotification>): ReactNode {
	const NickName = ({ user }: { user: ShallowUser | null | undefined }): ReactNode => <span className="nick-name">{user?.miiName ?? null}</span>;
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
		<PortalListViewItem href={`/users/${latestUser.pid}`}>
			<PortalMiiIcon pid={latestUser.pid} type="icon" />
			<div className="list-body">
				<span className="text">
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
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</span>
			</div>
		</PortalListViewItem>
	);
}

function EmpathyNotificationView(props: NotificationItemTypeProps<EmpathyNotification>): ReactNode {
	const NickName = ({ user }: { user: ShallowUser | null | undefined }): ReactNode => <span className="nick-name">{user?.miiName ?? null}</span>;
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
		<PortalListViewItem href={`/posts/${yeahedPost}`}>
			<PortalMiiIcon pid={latestUser.pid} type="icon" />
			<div className="list-body">
				<span className="text">
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
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</span>
			</div>
		</PortalListViewItem>
	);
}

function ReplyNotificationView(props: NotificationItemTypeProps<ReplyNotification>): ReactNode {
	const NickName = ({ user }: { user: ShallowUser | null | undefined }): ReactNode => <span className="nick-name">{user?.miiName ?? null}</span>;
	const { pid, user, parent } = props.notif.content;

	const i18nKey: TranslationKey = 'notifications.new_reply';

	return (
		<PortalListViewItem href={`/posts/${parent}`}>
			<PortalMiiIcon pid={pid} type="icon" />
			<div className="list-body">
				<span className="text">
					<T
						k={i18nKey}
						components={{
							reply_author: <NickName user={user} />
						}}
					/>
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</span>
			</div>
		</PortalListViewItem>
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
		<PortalListViewItem href="/titles/2551084080/new">
			<PortalIcon src="/images/bandwidthalert.png" type="icon" />
			<div className="list-body">
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
			</div>
		</PortalListViewItem>
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
		<PortalListViewItem href="/titles/2551084080/new">
			<PortalIcon src="/images/bandwidthalert.png" type="icon" />
			<div className="list-body">
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
			</div>
		</PortalListViewItem>
	);
}

function SystemNotificationView(props: NotificationItemTypeProps<SystemNotification>): ReactNode {
	return (
		<PortalListViewItem href={props.notif.content.link}>
			<PortalIcon src={props.notif.content.imagePath} type="icon" />
			<div className="list-body">
				<span className="text">
					{props.notif.content.text}
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</span>
			</div>
		</PortalListViewItem>
	);
}

function PortalNotificationItem(props: NotificationItemProps): ReactNode {
	const notif = props.notification.notif;
	if (notif.type === 'follow') {
		return <FollowNotificationView data={props.notification} notif={notif} />;
	}

	if (notif.type === 'empathy') {
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

export function PortalNotificationListView(props: NotificationListViewProps): ReactNode {
	return (
		<PortalListView type="list" id="news-list-content">
			{props.notifications.length === 0 ? <li><p><T k="notifications.none" /></p></li> : null}
			{props.notifications.map((notification, i) => (
				<PortalNotificationItem notification={notification} key={i} />
			))}
		</PortalListView>
	);
}

export function PortalNotificationWrapperView(props: NotificationWrapperViewProps): ReactNode {
	return (
		<PortalRoot title={T.str('global.notifications')}>
			<PortalNavBar selection={4} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title"><T k="global.notifications" /></h1>
				</header>
				<div className="body-content tab2-content" id="news-page">
					<div className="tab-body">
						{props.children}
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
