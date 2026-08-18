import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { CtrIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrIcon';
import { humanDate, humanFromNow } from '@/util';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import { CtrListView, CtrListViewItem } from '@/services/juxt-web/views/ctr/components/CtrListView';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@/services/juxt-web/views/common/components/T';
import type { NotificationItemProps, NotificationItemTypeProps, NotificationListViewProps, NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';
import type { EmpathyNotification, FollowNotification, LimitedFromPostingNotification, PostDeletedNotification, ShallowUser, SystemNotification } from '@/api/generated';

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
		<CtrListViewItem href={`/users/${latestUser.pid}`}>
			<CtrMiiIcon pid={latestUser.pid} type="icon"></CtrMiiIcon>
			<div className="list-body">
				<p>
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
				</p>
			</div>
		</CtrListViewItem>
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
		<CtrListViewItem href={`/posts/${yeahedPost}`}>
			<CtrMiiIcon pid={latestUser.pid} type="icon"></CtrMiiIcon>
			<div className="list-body">
				<p>
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
				</p>
			</div>
		</CtrListViewItem>
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
		<CtrListViewItem href="/titles/2551084080/new">
			<CtrIcon src="/images/bandwidthalert.png"></CtrIcon>
			<div className="list-body">
				<p style={{ color: 'black' }}>
					<span>
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
					</span>
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</p>
			</div>
		</CtrListViewItem>
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
		<CtrListViewItem href="/titles/2551084080/new">
			<CtrIcon src="/images/bandwidthalert.png"></CtrIcon>
			<div className="list-body">
				<p style={{ color: 'black' }}>
					<span>
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
					</span>
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</p>
			</div>
		</CtrListViewItem>
	);
}

function SystemNotificationView(props: NotificationItemTypeProps<SystemNotification>): ReactNode {
	return (
		<CtrListViewItem href={props.notif.content.link}>
			<CtrIcon src={props.notif.content.imagePath} type="icon"></CtrIcon>
			<div className="list-body">
				<p style={{ color: 'black' }}>
					<span>{props.notif.content.text}</span>
					<span className="timestamp">
						{' '}
						{humanFromNow(props.data.updatedAt)}
					</span>
				</p>
			</div>
		</CtrListViewItem>
	);
}

function CtrNotificationItem(props: NotificationItemProps): ReactNode {
	const notif = props.notification.notif;
	if (notif.type === 'follow') {
		return <FollowNotificationView data={props.notification} notif={notif} />;
	}

	if (notif.type === 'empathy') {
		return <EmpathyNotificationView data={props.notification} notif={notif} />;
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

export function CtrNotificationListView(props: NotificationListViewProps): ReactNode {
	return (
		<CtrListView type="icon-column">
			{props.notifications.length === 0 ? <li><p><T k="notifications.none" /></p></li> : null}
			{props.notifications.map((notification, i) => (
				<CtrNotificationItem notification={notification} key={i} />
			))}
		</CtrListView>
	);
}

export function CtrNotificationWrapperView(props: NotificationWrapperViewProps): ReactNode {
	return (
		<CtrRoot title={T.str('global.notifications')}>
			<CtrPageBody>
				<CtrPageTitledHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button="4"
				>
					<T k="global.notifications" />
				</CtrPageTitledHeader>
				<div className="body-content tab2-content" id="news-page">
					<div className="tab-body">
						{props.children}
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
