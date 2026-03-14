import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { CtrIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrIcon';
import { humanFromNow } from '@/util';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrNavTab, CtrNavTabs, CtrNavTabsRow } from '@/services/juxt-web/views/ctr/components/ui/CtrNavTabs';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@/services/juxt-web/views/common/components/T';
import type { NotificationItemProps, NotificationListViewProps, NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function CtrNotificationItem(props: NotificationItemProps): ReactNode {
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
			<>
				<CtrMiiIcon pid={Number(notif.objectID)} type="icon"></CtrMiiIcon>
				<div className="body">
					<p>
						<a className="link" href={notif.link ?? '#'} data-pjax="#body">
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
				<CtrIcon href={notif.link ?? undefined} src={notif.image ?? ''}></CtrIcon>
				<div className="body">
					<a href={notif.link ?? undefined} data-pjax="#body">
						<p style={{ color: 'black' }}>
							<span>{notif.text}</span>
							<span className="timestamp">
								{' '}
								{humanFromNow(notif.lastUpdated)}
							</span>
						</p>
					</a>
				</div>
			</>
		);
	}

	return <div>Invalid notification type!</div>;
}

export function CtrNotificationListView(props: NotificationListViewProps): ReactNode {
	return (
		<ul className="list-content-with-icon-column arrow-list" id="news-list-content">
			{props.notifications.length === 0 ? <li><p><T k="notifications.none" /></p></li> : null}
			{props.notifications.map((notification, i) => (
				<li key={i}>
					<CtrNotificationItem notification={notification} />
				</li>
			))}
		</ul>
	);
}

export function CtrNotificationWrapperView(props: NotificationWrapperViewProps): ReactNode {
	return (
		<CtrRoot title={T.str('global.notifications_and_messages')}>
			<CtrPageBody>
				<header
					id="header"
					data-toolbar-mode="normal"
					data-toolbar-active-button="4"
				>
					<h1 id="page-title"><T k="global.notifications_and_messages" /></h1>
				</header>
				<div className="body-content tab2-content" id="news-page">
					<CtrNavTabs target=".tab-body">
						<CtrNavTabsRow>
							<CtrNavTab href="/news/my_news" selected={props.selectedTab === 0}>
								<T k="global.updates" />
							</CtrNavTab>
							<CtrNavTab href="/friend_messages" selected={props.selectedTab === 1}>
								<T k="global.messages" />
							</CtrNavTab>
						</CtrNavTabsRow>
					</CtrNavTabs>
					<div className="tab-body">
						{props.children}
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
