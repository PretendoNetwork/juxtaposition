import cx from 'classnames';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { humanFromNow } from '@/util';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalMiiIcon } from '@/services/juxt-web/views/portal/components/ui/PortalMiiIcon';
import { PortalIcon } from '@/services/juxt-web/views/portal/components/ui/PortalIcon';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@/services/juxt-web/views/common/components/T';
import type { NotificationItemProps, NotificationListViewProps, NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function PortalNotificationItem(props: NotificationItemProps): ReactNode {
	const cache = useCache();
	const notif = props.notification;
	if (notif.type === 'follow') {
		const NickName = ({ userId }: { userId: string | number | null | undefined }): ReactNode => <span className="nick-name">{userId ? cache.getUserName(Number(userId)) : null}</span>;

		let i18nKey: TranslationKey = 'notifications.new_follower';
		if (notif.users.length === 2) {
			i18nKey = 'notifications.new_follower:multiple';
		}
		if (notif.users.length === 3) {
			i18nKey = 'notifications.new_follower_other';
		}
		if (notif.users.length > 3) {
			i18nKey = 'notifications.new_follower_other:multiple';
		}

		return (
			<>
				<PortalMiiIcon pid={Number(notif.objectID)} type="icon"></PortalMiiIcon>
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
									follower_one: <NickName userId={notif.objectID} />,
									follower_two: <NickName userId={notif.users[0]?.user} />
								}}
							/>
						</a>
						<span className="timestamp">
							{' '}
							{humanFromNow(notif.lastUpdated)}
						</span>
					</p>
				</div>
			</>
		);
	}

	if (notif.type === 'notice') {
		return (
			<>
				<PortalIcon href={notif.link ?? undefined} src={notif.image ?? ''}></PortalIcon>
				<div className="body">
					<a href={notif.link ?? '#'}>
						<span className="text">
							{notif.text}
							<span className="timestamp">
								{' '}
								{humanFromNow(notif.lastUpdated)}
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
					<menu className="tab-header">
						<li id="tab-header-my-news" className={cx('tab-button', { selected: props.selectedTab === 0 })} data-show-post-button="1">
							<a href="/news/my_news" data-pjax-replace="1" data-sound="SE_WAVE_SELECT_TAB">
								<span className="new-post"><T k="global.updates" /></span>
							</a>
						</li>
						<li id="tab-header-friend-request" className={cx('tab-button', { selected: props.selectedTab === 1 })}>
							<a href="/news/friend_requests" data-pjax-cache-container="#body" data-pjax-replace="1" data-sound="SE_WAVE_SELECT_TAB">
								<span><T k="global.friend_requests" /></span>
							</a>
						</li>
					</menu>
					<div className="tab-body">
						{props.children}
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
