import { PortalListView, PortalListViewItem } from '@/services/juxt-web/views/portal/components/PortalListView';
import { PortalMiiIcon } from '@/services/juxt-web/views/portal/components/ui/PortalMiiIcon';
import { PortalCommunityIcon } from '@/services/juxt-web/views/portal/components/ui/PortalCommunityIcon';
import type { ReactNode } from 'react';
import type { UserPageFollowingViewProps } from '@/services/juxt-web/views/web/userPageFollowingView';

export function PortalUserPageFollowingView(props: UserPageFollowingViewProps): ReactNode {
	return (
		<div>
			<PortalListView type="table-3col">
				{props.followers.map(user => (
					<PortalListViewItem
						key={user.pid}
						id={user.pid.toString()}
						href={`/users/show?pid=${user.pid}`}
					>
						<PortalMiiIcon pid={user.pid} type="icon" />
						<div className="list-body">
							<span>{user.miiName}</span>
						</div>
					</PortalListViewItem>
				))}
				{props.communities.map(community => (
					<PortalListViewItem
						key={community.olive_community_id}
						id={community.olive_community_id}
						href={`/titles/${community.olive_community_id}/new`}
					>
						<PortalCommunityIcon community={community} type="icon" size="96" />
						<div className="list-body">
							<span>{community.name}</span>
						</div>
					</PortalListViewItem>
				))}
			</PortalListView>
		</div>
	);
}
