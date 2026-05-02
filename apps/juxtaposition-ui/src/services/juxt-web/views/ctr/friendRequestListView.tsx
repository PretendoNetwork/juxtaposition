import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrPageHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import type { ReactNode } from 'react';
import type { FriendRequestItemProps, FriendRequestListViewProps } from '@/services/juxt-web/views/web/friendRequestListView';
import type { NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function CtrFriendRequestItem(props: FriendRequestItemProps): ReactNode {
	const url = useUrl();
	const cache = useCache();

	const senderId = props.request.sender;
	return (
		<li>
			<a href={`/users/${senderId}`} data-pjax="#body" className="icon-container notify">
				<img src={url.cdn(`/mii/${senderId}/normal_face.png`)} className="icon" />
			</a>
			<div className="body">
				<p>
					<span className="nick-name">{cache.getUserName(senderId)}</span>
					<span>{props.request.message}</span>
					<span className="timestamp">
						{' '}
						{moment(Number(props.request.sent) * 1000).fromNow()}
					</span>
				</p>
			</div>
		</li>
	);
}

export function CtrFriendRequestListView(props: FriendRequestListViewProps): ReactNode {
	const cache = useCache();
	return (
		<ul className="list-content-with-icon-column arrow-list" id="news-list-content">
			{props.requests.length === 0 ? <li><p><T k="friend_requests.none" /></p></li> : null}
			{props.requests.map((req, i) => {
				if (!cache.getUserName(req.sender)) {
					return null;
				}
				return <CtrFriendRequestItem key={i} request={req} />;
			})}
		</ul>
	);
}

export function CtrFriendRequestWrapperView(props: NotificationWrapperViewProps): ReactNode {
	return (
		<CtrRoot title={T.str('global.friend_requests')}>
			<CtrPageBody>
				<CtrPageHeader
					type="plain"
					data-toolbar-mode="normal"
					data-toolbar-active-button="5"
				>
					<T k="global.friend_requests" />
				</CtrPageHeader>
				<div className="body-content tab2-content" id="news-page">
					<div className="tab-body">
						{props.children}
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
