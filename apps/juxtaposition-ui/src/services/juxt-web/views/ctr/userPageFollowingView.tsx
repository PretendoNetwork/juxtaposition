import { CtrListView, CtrListViewItem } from '@/services/juxt-web/views/ctr/components/CtrListView';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { CtrCommunityIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrCommunityIcon';
import type { ReactNode } from 'react';
import type { UserPageFollowingViewProps } from '@/services/juxt-web/views/web/userPageFollowingView';

export function CtrUserPageFollowingView(props: UserPageFollowingViewProps): ReactNode {
	return (
		<div className="communities-list">
			<CtrListView type="icon-column">
				{props.followers.map(user => (
					<CtrListViewItem href={`/users/show?pid=${user.pid}`} key={user.pid}>
						<CtrMiiIcon pid={user.pid} type="icon" />
						<div className="list-body">
							{user.miiName}
						</div>
					</CtrListViewItem>
				))}
				{props.communities.map(community => (
					<CtrListViewItem href={`/titles/${community.olive_community_id}/new`} key={community.olive_community_id}>
						<CtrCommunityIcon community={community} type="icon" size="64" />
						<div className="list-body">
							{community.name}
						</div>
					</CtrListViewItem>
				))}
			</CtrListView>
		</div>
	);
}
