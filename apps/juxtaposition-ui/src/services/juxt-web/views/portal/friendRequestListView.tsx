import moment from 'moment';
import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/components/PortalNavBar';
import { PortalListView, PortalListViewItem } from '@/services/juxt-web/views/portal/components/PortalListView';
import { PortalMiiIcon } from '@/services/juxt-web/views/portal/components/ui/PortalMiiIcon';
import type { ReactNode } from 'react';
import type { FriendRequestItemProps, FriendRequestListViewProps } from '@/services/juxt-web/views/web/friendRequestListView';
import type { NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function PortalFriendRequestItem(props: FriendRequestItemProps): ReactNode {
	const req = props.request;
	return (
		<PortalListViewItem href={`/users/${req.sender.pid}`}>
			<PortalMiiIcon pid={req.sender.pid} type="icon" />
			<div className="list-body">
				<span className="text">
					<span className="nick-name">{req.sender.miiName}</span>
					<span>{req.message}</span>
					<span className="timestamp">
						{' '}
						{moment(req.sentAt).fromNow()}
					</span>
				</span>
			</div>
		</PortalListViewItem>
	);
}

export function PortalFriendRequestListView(props: FriendRequestListViewProps): ReactNode {
	return (
		<PortalListView type="list" id="news-list-content">
			{props.requests.length === 0 ? <li><p><T k="friend_requests.none" /></p></li> : null}
			{props.requests.map((req, i) => {
				return <PortalFriendRequestItem key={i} request={req} />;
			})}
		</PortalListView>
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
