import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { UserPageFollowingViewProps } from '@/services/juxt-web/views/web/userPageFollowingView';

export function PortalUserPageFollowingView(props: UserPageFollowingViewProps): ReactNode {
	const url = useUrl();
	return (
		<div className="communities-list">
			<ul className="list-content-with-icon-column" id="community-new-content">
				{props.followers.map(user => (
					<li key={user.pid} id={user.pid.toString()}>
						<span className="icon-container"><img src={url.cdn(`/mii/${user.pid}/normal_face.png`)} className="icon" /></span>
						<a href={`/users/show?pid=${user.pid}`} data-pjax="#body" className="scroll to-community-button"></a>
						<div className="body">
							<div className="body-content">
								<span className="community-name title">{user.miiName}</span>
							</div>
						</div>
					</li>
				))}
				{props.communities.map(community => (
					<li key={community.id} id={community.id}>
						<span className="icon-container"><img src={url.cdn(`/icons/${community.id}/128.png`)} className="icon" /></span>
						<a href={`/titles/${community.id}/new`} data-pjax="#body" className="scroll to-community-button"></a>
						<div className="body">
							<div className="body-content">
								<span className="community-name title">{community.name}</span>
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
