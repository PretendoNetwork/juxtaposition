import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalCommunityItem } from '@/services/juxt-web/views/portal/communityListView';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { CommunitySchema } from '@/models/communities';
import type { CommunityDto } from '@/api/community';

export type SubCommunityViewProps = {
	ctx: RenderContext;
	community: InferSchemaType<typeof CommunitySchema>;
	subcommunities: CommunityDto[];
};

export function PortalSubCommunityView(props: SubCommunityViewProps): ReactNode {
	return (
		<PortalRoot title={props.ctx.lang.global.communities} onLoad="stopLoading();">
			<PortalNavBar ctx={props.ctx} selection={2} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title">
						{props.community.name}
						{' '}
						Related Communities
					</h1>
				</header>
				<div className="body-content">
					<div className="communities-list double">
						<ul className="list-content-with-icon-column" id="community-new-content">
							{props.subcommunities.map(community => (
								<PortalCommunityItem key={community.olive_community_id} ctx={props.ctx} community={community} />
							))}
						</ul>
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
