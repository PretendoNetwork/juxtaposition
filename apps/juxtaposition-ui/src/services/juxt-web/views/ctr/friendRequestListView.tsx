import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
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
				<header
					id="header"
					data-toolbar-mode="normal"
					data-toolbar-active-button="5"
				>
					<h1 id="page-title"><T k="global.friend_requests" /></h1>
				</header>
				<div className="body-content tab2-content" id="news-page">
					<div className="tab-body">
						{props.children}
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
