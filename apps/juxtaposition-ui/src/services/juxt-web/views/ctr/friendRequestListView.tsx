import moment from 'moment';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import { CtrListView, CtrListViewItem } from '@/services/juxt-web/views/ctr/components/CtrListView';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import type { ReactNode } from 'react';
import type { FriendRequestItemProps, FriendRequestListViewProps } from '@/services/juxt-web/views/web/friendRequestListView';
import type { NotificationWrapperViewProps } from '@/services/juxt-web/views/web/notificationListView';

function CtrFriendRequestItem(props: FriendRequestItemProps): ReactNode {
	const req = props.request;
	return (
		<CtrListViewItem href={`/users/${req.sender.pid}`}>
			<CtrMiiIcon type="icon" pid={req.sender.pid} />
			<div className="list-body">
				<p>
					<span className="nick-name">{req.sender.miiName}</span>
					<span>{req.message}</span>
					<span className="timestamp">
						{' '}
						{moment(req.sentAt).fromNow()}
					</span>
				</p>
			</div>
		</CtrListViewItem>
	);
}

export function CtrFriendRequestListView(props: FriendRequestListViewProps): ReactNode {
	return (
		<CtrListView type="icon-column">
			{props.requests.length === 0 ? <li><p><T k="friend_requests.none" /></p></li> : null}
			{props.requests.map((req, i) => {
				return <CtrFriendRequestItem key={i} request={req} />;
			})}
		</CtrListView>
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
