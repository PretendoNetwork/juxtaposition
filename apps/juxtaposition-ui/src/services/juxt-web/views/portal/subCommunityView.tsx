import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalCommunityItem } from '@/services/juxt-web/views/portal/communityListView';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { CommunitySchema } from '@/models/communities';

export type SubCommunityViewProps = {
	community: InferSchemaType<typeof CommunitySchema>;
	subcommunities: InferSchemaType<typeof CommunitySchema>[];
};

export function PortalSubCommunityView(props: SubCommunityViewProps): ReactNode {
	return (
		<PortalRoot title={<T k="global.communities" />} onLoad="stopLoading();">
			<PortalNavBar selection={2} />
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
								<PortalCommunityItem key={community.olive_community_id} community={community} />
							))}
						</ul>
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
