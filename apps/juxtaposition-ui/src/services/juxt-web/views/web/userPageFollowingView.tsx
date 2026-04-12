import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { ShallowUser } from '@/api/generated';

export type CommunityViewData = {
	id: string;
	name: string;
};

export type UserPageFollowingViewProps = {
	followers: ShallowUser[];
	communities: CommunityViewData[];
};

export function WebUserPageFollowingView(props: UserPageFollowingViewProps): ReactNode {
	const url = useUrl();
	return (
		<ul className="list-content-with-icon-and-text arrow-list accounts" id="news-list-content">
			{props.followers.map(user => (
				<li key={user.pid} id={user.pid.toString()}>
					<div className="hover">
						<a href={`/users/${user.pid}`} className="icon-container notify">
							<img src={url.cdn(`/mii/${user.pid}/normal_face.png`)} className="icon" />
						</a>
						<a className="body" href={`/users/${user.pid}`}>
							<span className="text"><span className="nick-name">{user.miiName}</span></span>
						</a>
					</div>
				</li>
			))}
			{props.communities.map(community => (
				<li key={community.id} id={community.id}>
					<div className="hover">
						<a href={`/titles/${community.id}/new`} className="icon-container notify">
							<img src={url.cdn(`/icons/${community.id}/128.png`)} className="icon" />
						</a>
						<a className="body" href={`/titles/${community.id}/new`}>
							<span className="text"><span className="nick-name">{community.name}</span></span>
						</a>
					</div>
				</li>
			))}
		</ul>
	);
}
