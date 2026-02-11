import moment from 'moment';
import cx from 'classnames';
import { utils } from '@/services/juxt-web/views/utils';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import type { ReactNode } from 'react';
import type { NotificationItemProps, NotificationListViewProps, NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function CtrNotificationItem(props: NotificationItemProps): ReactNode {
	const notif = props.notification;
	if (notif.type === 'follow') {
		const NickName = ({ userId }: { userId: string | number | null | undefined }): ReactNode => <span className="nick-name">{userId ? props.ctx.usersMap.get(Number(userId)) : null}</span>;
		return (
			<>
				<a href={`/users/${notif.objectID}`} data-pjax="#body" className="icon-container notify">
					<img src={utils.cdn(props.ctx, `/mii/${notif.objectID}/normal_face.png`)} className="icon" />
				</a>
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
						<p style={{ color: 'black' }}>
							<span>{notif.text}</span>
							<span className="timestamp">
								{' '}
								{moment(notif.lastUpdated).fromNow()}
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
			{props.notifications.length === 0 ? <li><p>{props.ctx.lang.notifications.none}</p></li> : null}
			{props.notifications.map((notification, i) => (
				<li key={i}>
					<CtrNotificationItem ctx={props.ctx} notification={notification} />
				</li>
			))}
		</ul>
	);
}

export function CtrNotificationWrapperView(props: NotificationWrapperViewProps): ReactNode {
	return (
		<CtrRoot ctx={props.ctx} title="Notifications and Messages">
			<CtrPageBody>
				<header id="header">
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
								<span>{props.ctx.lang.global.messages}</span>
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
