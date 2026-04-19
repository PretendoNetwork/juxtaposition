import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import type { ReactNode } from 'react';
import type { FriendRequestItemProps, FriendRequestListViewProps } from '@/services/juxt-web/views/web/friendRequestListView';
import type { NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function PortalFriendRequestItem(props: FriendRequestItemProps): ReactNode {
	const url = useUrl();

	const req = props.request;
	return (
		<li>
			<a href={`/users/${req.sender.pid}`} data-pjax="#body" className="icon-container notify">
				<img src={url.cdn(`/mii/${req.sender.pid}/normal_face.png`)} className="icon" />
			</a>
			<div className="body">
				<p className="text">
					<span className="nick-name">{req.sender.miiName}</span>
					<span>{req.message}</span>
					<span className="timestamp">
						{' '}
						{moment(req.sentAt).fromNow()}
					</span>
				</p>
			</div>
		</li>
	);
}

export function PortalFriendRequestListView(props: FriendRequestListViewProps): ReactNode {
	return (
		<ul className="list-content-with-icon-and-text arrow-list" id="news-list-content">
			{props.requests.length === 0 ? <li><p><T k="friend_requests.none" /></p></li> : null}
			{props.requests.map((req, i) => {
				return <PortalFriendRequestItem key={i} request={req} />;
			})}
		</ul>
	);
}

export function PortalFriendRequestWrapperView(props: NotificationWrapperViewProps): ReactNode {
	return (
		<PortalRoot title={T.str('global.notifications')}>
			<PortalNavBar selection={3} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title"><T k="global.friend_requests" /></h1>
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
