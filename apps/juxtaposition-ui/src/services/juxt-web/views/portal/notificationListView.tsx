import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/components/PortalNavBar';
import { humanDate, humanFromNow } from '@/util';
import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalMiiIcon } from '@/services/juxt-web/views/portal/components/ui/PortalMiiIcon';
import { PortalIcon } from '@/services/juxt-web/views/portal/components/ui/PortalIcon';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@/services/juxt-web/views/common/components/T';
import type { NotificationItemProps, NotificationListViewProps, NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';
import type { ShallowUser } from '@/api/generated';

function PortalNotificationItem(props: NotificationItemProps): ReactNode {
	const data = props.notification;
	if (data.notif.type === 'follow') {
		const NickName = ({ user }: { user: ShallowUser | null | undefined }): ReactNode => <span className="nick-name">{user?.miiName ?? null}</span>;
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
			<>
				<PortalMiiIcon pid={latestUser.pid} type="icon"></PortalMiiIcon>
				<div className="body">
					<p className="text">
						<a className="link" href={`/users/${latestUser.pid}`}>
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
						</a>
						<span className="timestamp">
							{' '}
							{humanFromNow(data.updatedAt)}
						</span>
					</p>
				</div>
			</>
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
			<>
				<PortalIcon href="/titles/2551084080/new" src="/images/bandwidthalert.png"></PortalIcon>
				<div className="body">
					<a href="/titles/2551084080/new">
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
			</>
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
			<>
				<PortalIcon href="/titles/2551084080/new" src="/images/bandwidthalert.png"></PortalIcon>
				<div className="body">
					<a href="/titles/2551084080/new">
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
			</>
		);
	}

	if (data.notif.type === 'system') {
		return (
			<>
				<PortalIcon href={data.notif.content.link} src={data.notif.content.imagePath}></PortalIcon>
				<div className="body">
					<a href={data.notif.content.link}>
						<span className="text">
							{data.notif.content.text}
							<span className="timestamp">
								{' '}
								{humanFromNow(data.updatedAt)}
							</span>
						</span>
					</a>
				</div>
			</>
		);
	}

	return <div>Invalid notification type!</div>;
}

export function PortalNotificationListView(props: NotificationListViewProps): ReactNode {
	return (
		<ul className="list-content-with-icon-and-text arrow-list" id="news-list-content">
			{props.notifications.length === 0 ? <li><p><T k="notifications.none" /></p></li> : null}
			{props.notifications.map((notification, i) => (
				<li key={i}>
					<PortalNotificationItem notification={notification} />
				</li>
			))}
		</ul>
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
