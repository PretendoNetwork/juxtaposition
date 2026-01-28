import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrCommunityItem } from '@/services/juxt-web/views/ctr/communityListView';
import type { ReactNode } from 'react';
import type { SubCommunityViewProps } from '@/services/juxt-web/views/portal/subCommunityView';

export function CtrSubCommunityView(props: SubCommunityViewProps): ReactNode {
	return (
		<CtrRoot ctx={props.ctx} title={props.ctx.lang.all_communities.text}>
			<CtrPageBody>
				<header id="header">
					<h1 id="page-title">
						{props.community.name}
						{' '}
						Related Communities
					</h1>
				</header>
				<div className="body-content">
					<div className="communities-list">
						<ul className="list-content-with-icon-column" id="community-new-content">
							{props.subcommunities.map(community => (
								<CtrCommunityItem key={community.olive_community_id} ctx={props.ctx} community={community} />
							))}
						</ul>
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
