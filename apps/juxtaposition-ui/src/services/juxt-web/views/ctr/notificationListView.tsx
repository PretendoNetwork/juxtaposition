import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { CtrIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrIcon';
import { humanDate, humanFromNow } from '@/util';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@/services/juxt-web/views/common/components/T';
import type { NotificationItemProps, NotificationListViewProps, NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function CtrNotificationItem(props: NotificationItemProps): ReactNode {
	const cache = useCache();
	const data = props.notification;
	if (data.notif.type === 'follow') {
		const NickName = ({ userId }: { userId: string | number | null | undefined }): ReactNode => <span className="nick-name">{userId ? cache.getUserName(Number(userId)) : null}</span>;
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
				<CtrMiiIcon pid={latestUser.pid} type="icon"></CtrMiiIcon>
				<div className="body">
					<p>
						<a className="link" href={`/users/${latestUser.pid}`} data-pjax="#body">
							<T
								k={i18nKey}
								values={{
									count: users.length,
									count_other: Math.max(0, users.length - 2)
								}}
								components={{
									follower_one: <NickName userId={users[0]?.pid} />,
									follower_two: <NickName userId={users[1]?.pid} />
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
				<CtrIcon href="/titles/2551084080/new" src="/images/bandwidthalert.png"></CtrIcon>
				<div className="body">
					<a href="/titles/2551084080/new" data-pjax="#body">
						<p style={{ color: 'black' }}>
							<span>
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
							</span>
							<span className="timestamp">
								{' '}
								{humanFromNow(data.updatedAt)}
							</span>
						</p>
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
				<CtrIcon href="/titles/2551084080/new" src="/images/bandwidthalert.png"></CtrIcon>
				<div className="body">
					<a href="/titles/2551084080/new" data-pjax="#body">
						<p style={{ color: 'black' }}>
							<span>
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
							</span>
							<span className="timestamp">
								{' '}
								{humanFromNow(data.updatedAt)}
							</span>
						</p>
					</a>
				</div>
			</>
		);
	}

	if (data.notif.type === 'system') {
		return (
			<>
				<CtrIcon href={data.notif.content.link} src={data.notif.content.imagePath}></CtrIcon>
				<div className="body">
					<a href={data.notif.content.link} data-pjax="#body">
						<p style={{ color: 'black' }}>
							<span>{data.notif.content.text}</span>
							<span className="timestamp">
								{' '}
								{humanFromNow(data.updatedAt)}
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
