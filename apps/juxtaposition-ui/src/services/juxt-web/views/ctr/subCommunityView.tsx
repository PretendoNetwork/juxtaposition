import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrCommunityItem } from '@/services/juxt-web/views/ctr/communityListView';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import type { ReactNode } from 'react';
import type { SubCommunityViewProps } from '@/services/juxt-web/views/portal/subCommunityView';

export function CtrSubCommunityView(props: SubCommunityViewProps): ReactNode {
	return (
		<CtrRoot title={T.str('all_communities.text')}>
			<CtrPageBody>
				<CtrPageTitledHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button="3"
				>
					<T k="community.related_to" values={{ community: props.community.name }} />
				</CtrPageTitledHeader>
				<div className="body-content">
					<div className="communities-list">
						<ul className="list-content-with-icon-column" id="community-new-content">
							{props.subcommunities.map(community => (
								<CtrCommunityItem key={community.olive_community_id} community={community} />
							))}
						</ul>
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
