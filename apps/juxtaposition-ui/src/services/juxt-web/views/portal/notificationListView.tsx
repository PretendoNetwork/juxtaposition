import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { humanFromNow } from '@/util';
import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalMiiIcon } from '@/services/juxt-web/views/portal/components/ui/PortalMiiIcon';
import { PortalIcon } from '@/services/juxt-web/views/portal/components/ui/PortalIcon';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@/services/juxt-web/views/common/components/T';
import type { NotificationItemProps, NotificationListViewProps, NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';
import type { ShallowUser } from '@/api/generated';

function PortalNotificationItem(props: NotificationItemProps): ReactNode {
	const notif = props.notification;
	if (notif.type === 'follow') {
		const NickName = ({ user }: { user: ShallowUser | null | undefined }): ReactNode => <span className="nick-name">{user?.miiName ?? null}</span>;

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
			<>
				<PortalMiiIcon pid={Number(notif.resourceId)} type="icon"></PortalMiiIcon>
				<div className="body">
					<p className="text">
						<a className="link" href={notif.link ?? '#'}>
							<T
								k={i18nKey}
								values={{
									count: notif.users.length,
									count_other: Math.max(0, notif.users.length - 2)
								}}
								components={{
									follower_one: <NickName user={notif.users[0]?.user} />,
									follower_two: <NickName user={notif.users[1]?.user} />
								}}
							/>
						</a>
						<span className="timestamp">
							{' '}
							{humanFromNow(notif.updatedAt)}
						</span>
					</p>
				</div>
			</>
		);
	}

	if (notif.type === 'notice') {
		return (
			<>
				<PortalIcon href={notif.link ?? undefined} src={notif.imageUrl}></PortalIcon>
				<div className="body">
					<a href={notif.link ?? '#'}>
						<span className="text">
							{notif.content}
							<span className="timestamp">
								{' '}
								{humanFromNow(notif.updatedAt)}
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
