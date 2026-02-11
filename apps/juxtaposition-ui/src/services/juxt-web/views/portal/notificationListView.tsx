import moment from 'moment';
import cx from 'classnames';
import { utils } from '@/services/juxt-web/views/utils';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import type { ReactNode } from 'react';
import type { NotificationItemProps, NotificationListViewProps, NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function PortalNotificationItem(props: NotificationItemProps): ReactNode {
	const notif = props.notification;
	if (notif.type === 'follow') {
		const NickName = ({ userId }: { userId: string | number | null | undefined }): ReactNode => <span className="nick-name">{userId ? props.ctx.usersMap.get(Number(userId)) : null}</span>;
		return (
			<>
				<a href={`/users/${notif.objectID}`} data-pjax="#body" className="icon-container notify">
					<img src={utils.cdn(props.ctx, `/mii/${notif.objectID}/normal_face.png`)} className="icon" />
				</a>
				<div className="body">
					<p className="text">
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
						<a className="link" href={notif.link ?? '#'}>{props.ctx.lang.notifications.new_follower}</a>
						<span className="timestamp">
							{' '}
							{moment(notif.lastUpdated).fromNow()}
						</span>
					</p>
				</div>
			</>
		);
	}

	if (notif.type === 'notice') {
		return (
			<>
				<a href={notif.link ?? '#'} data-pjax="#body" className="icon-container notify">
					<img src={notif.image ?? undefined} className="icon" />
				</a>
				<div className="body">
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
			</>
		);
	}

	return <div>Invalid notification type!</div>;
}

export function PortalNotificationListView(props: NotificationListViewProps): ReactNode {
	return (
		<ul className="list-content-with-icon-and-text arrow-list" id="news-list-content">
			{props.notifications.length === 0 ? <li><p>{props.ctx.lang.notifications.none}</p></li> : null}
			{props.notifications.map((notification, i) => (
				<li key={i}>
					<PortalNotificationItem ctx={props.ctx} notification={notification} />
				</li>
			))}
		</ul>
	);
}

export function PortalNotificationWrapperView(props: NotificationWrapperViewProps): ReactNode {
	return (
		<PortalRoot title={props.ctx.lang.global.notifications}>
			<PortalNavBar ctx={props.ctx} selection={4} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title">Notifications</h1>
				</header>
				<div className="body-content tab2-content" id="news-page">
					<menu className="tab-header">
						<li id="tab-header-my-news" className={cx('tab-button', { selected: props.selectedTab === 0 })} data-show-post-button="1">
							<a href="/news/my_news" data-pjax-replace="1" data-sound="SE_WAVE_SELECT_TAB">
								<span className="new-post">Updates</span>
							</a>
						</li>
						<li id="tab-header-friend-request" className={cx('tab-button', { selected: props.selectedTab === 1 })}>
							<a href="/news/friend_requests" data-pjax-cache-container="#body" data-pjax-replace="1" data-sound="SE_WAVE_SELECT_TAB">
								<span>Friend Requests</span>
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
