import moment from 'moment';
import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { FriendRequestItemProps, FriendRequestListViewProps } from '@/services/juxt-web/views/web/friendRequestListView';

function PortalFriendRequestItem(props: FriendRequestItemProps): ReactNode {
	const senderId = props.request.sender;
	return (
		<li>
			<a href={`/users/${senderId}`} data-pjax="#body" className="icon-container notify">
				<img src={utils.cdn(props.ctx, `/mii/${senderId}/normal_face.png`)} className="icon" />
			</a>
			<div className="body">
				<p className="text">
					<span className="nick-name">{props.ctx.usersMap.get(senderId)}</span>
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
	return (
		<ul className="list-content-with-icon-and-text arrow-list" id="news-list-content">
			{props.requests.length === 0 ? <li><p>No Friend Requests</p></li> : null}
			{props.requests.map((req, i) => {
				if (!props.ctx.usersMap.get(req.sender)) {
					return null;
				}
				return <PortalFriendRequestItem key={i} ctx={props.ctx} request={req} />;
			})}
		</ul>
	);
}
