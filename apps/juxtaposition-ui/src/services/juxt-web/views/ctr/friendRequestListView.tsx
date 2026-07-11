import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import type { ReactNode } from 'react';
import type { FriendRequestItemProps, FriendRequestListViewProps } from '@/services/juxt-web/views/web/friendRequestListView';
import type { NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function CtrFriendRequestItem(props: FriendRequestItemProps): ReactNode {
	const url = useUrl();

	const req = props.request;
	return (
		<li>
			<a href={`/users/${req.sender.pid}`} data-pjax="#body" className="icon-container notify">
				<img src={url.cdn(`/mii/${req.sender.pid}/normal_face.png`)} className="icon" />
			</a>
			<div className="body">
				<p>
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

export function CtrFriendRequestListView(props: FriendRequestListViewProps): ReactNode {
	return (
		<ul className="list-content-with-icon-column arrow-list" id="news-list-content">
			{props.requests.length === 0 ? <li><p><T k="friend_requests.none" /></p></li> : null}
			{props.requests.map((req, i) => {
				return <CtrFriendRequestItem key={i} request={req} />;
			})}
		</ul>
	);
}

export function CtrFriendRequestWrapperView(props: NotificationWrapperViewProps): ReactNode {
	return (
		<CtrRoot title={T.str('global.friend_requests')}>
			<CtrPageBody>
				<CtrPageTitledHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button="5"
				>
					<T k="global.friend_requests" />
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
