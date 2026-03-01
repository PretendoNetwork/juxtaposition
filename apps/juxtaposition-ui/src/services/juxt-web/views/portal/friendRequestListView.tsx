import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import type { ReactNode } from 'react';
import type { FriendRequestItemProps, FriendRequestListViewProps } from '@/services/juxt-web/views/web/friendRequestListView';

function PortalFriendRequestItem(props: FriendRequestItemProps): ReactNode {
	const url = useUrl();
	const cache = useCache();

	const senderId = props.request.sender;
	return (
		<li>
			<a href={`/users/${senderId}`} data-pjax="#body" className="icon-container notify">
				<img src={url.cdn(`/mii/${senderId}/normal_face.png`)} className="icon" />
			</a>
			<div className="body">
				<p className="text">
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

export function PortalFriendRequestListView(props: FriendRequestListViewProps): ReactNode {
	const cache = useCache();
	return (
		<ul className="list-content-with-icon-and-text arrow-list" id="news-list-content">
			{props.requests.length === 0 ? <li><p>No Friend Requests</p></li> : null}
			{props.requests.map((req, i) => {
				if (!cache.getUserName(req.sender)) {
					return null;
				}
				return <PortalFriendRequestItem key={i} request={req} />;
			})}
		</ul>
	);
}
