import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrCommunityItem } from '@/services/juxt-web/views/ctr/communityListView';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import { CtrListView } from '@/services/juxt-web/views/ctr/components/CtrListView';
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
					<CtrListView type="icon-column">
						{props.subcommunities.map(community => (
							<CtrCommunityItem key={community.olive_community_id} community={community} />
						))}
					</CtrListView>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
