import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { HydratedSettingsDocument } from '@/models/settings';

export type CommunityViewData = {
	id: string;
	name: string;
};

export type UserPageFollowingViewProps = {
	ctx: RenderContext;
	followers: HydratedSettingsDocument[];
	communities: CommunityViewData[];
};

export function WebUserPageFollowingView(props: UserPageFollowingViewProps): ReactNode {
	return (
		<ul className="list-content-with-icon-and-text arrow-list accounts" id="news-list-content">
			{props.followers.map(user => (
				<li key={user.pid} id={user.pid.toString()}>
					<div className="hover">
						<a href={`/users/${user.pid}`} data-pjax="#body" className="icon-container notify">
							<img src={utils.cdn(props.ctx, `/mii/${user.pid}/normal_face.png`)} className="icon" />
						</a>
						<a className="body" href={`/users/${user.pid}`}>
							<span className="text"><span className="nick-name">{user.screen_name}</span></span>
						</a>
					</div>
				</li>
			))}
			{props.communities.map(community => (
				<li key={community.id} id={community.id}>
					<div className="hover">
						<a href={`/titles/${community.id}/new`} data-pjax="#body" className="icon-container notify">
							<img src={utils.cdn(props.ctx, `/icons/${community.id}/128.png`)} className="icon" />
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
