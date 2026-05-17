import { WebCommunityIcon } from '@/services/juxt-web/views/web/components/ui/WebCommunityIcon';
import { WebMiiIcon } from '@/services/juxt-web/views/web/components/ui/WebMiiIcon';
import type { ReactNode } from 'react';
import type { Community, ShallowUser } from '@/api/generated';

export type UserPageFollowingViewProps = {
	followers: ShallowUser[];
	communities: Community[];
};

export function WebUserPageFollowingView(props: UserPageFollowingViewProps): ReactNode {
	return (
		<ul className="list-content-with-icon-and-text arrow-list accounts" id="news-list-content">
			{props.followers.map(user => (
				<li key={user.pid} id={user.pid.toString()}>
					<a className="hover" href={`/users/${user.pid}`}>
						<WebMiiIcon pid={user.pid} type="icon" link={false} />
						{/* TODO rebuild the CSS here so we can remove the duplication */}
						<div className="body">
							<span className="text">
								<span className="nick-name">{user.miiName}</span>
							</span>
						</div>
					</a>
				</li>
			))}
			{props.communities.map(community => (
				<li key={community.id} id={community.id}>
					<a className="hover" href={`/titles/${community.olive_community_id}/new`}>
						<WebCommunityIcon community={community} size="64" />
						<div className="body">
							<span className="text">
								<span className="nick-name">{community.name}</span>
							</span>
						</div>
					</a>
				</li>
			))}
		</ul>
	);
}
