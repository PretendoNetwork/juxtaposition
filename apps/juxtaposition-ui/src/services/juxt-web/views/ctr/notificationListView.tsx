import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { CtrIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrIcon';
import { humanFromNow } from '@/util';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { NotificationItemProps, NotificationListViewProps, NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function CtrNotificationItem(props: NotificationItemProps): ReactNode {
	const cache = useCache();
	const notif = props.notification;
	if (notif.type === 'follow') {
		const NickName = ({ userId }: { userId: string | number | null | undefined }): ReactNode => <span className="nick-name">{userId ? cache.getUserName(Number(userId)) : null}</span>;
		return (
			<>
				<CtrMiiIcon pid={Number(notif.objectID)} type="icon"></CtrMiiIcon>
				<div className="body">
					<p>
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
						<a className="link" href={notif.link ?? '#'}>
							{' '}
							<T k="notifications.new_follower" />
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
					<a href={notif.link ?? undefined}>
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
		<CtrRoot title="Notifications and Messages">
			<CtrPageBody>
				<header
					id="header"
					data-toolbar-mode="normal"
					data-toolbar-active-button="4"
				>
					<h1 id="page-title">Notifications and Messages</h1>
				</header>
				<div className="body-content tab2-content" id="news-page">
					<menu className="tab-header no-margin">
						<li id="tab-header-my-news" className={cx('tab-button', { selected: props.selectedTab === 0 })} data-show-post-button="1">
							<a href="/news/my_news" data-pjax-replace="1" data-sound="SE_WAVE_SELECT_TAB">
								<span className="new-post">Updates</span>
							</a>
						</li>
						<li id="tab-header-friend-request" className={cx('tab-button', { selected: props.selectedTab === 1 })}>
							<a href="/friend_messages" data-pjax-cache-container="#body" data-pjax-replace="1" data-sound="SE_WAVE_SELECT_TAB">
								<span><T k="global.messages" /></span>
							</a>
						</li>
					</menu>
					<div className="tab-body">
						{props.children}
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
