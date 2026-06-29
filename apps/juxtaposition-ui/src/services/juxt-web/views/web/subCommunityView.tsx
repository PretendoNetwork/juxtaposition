import { T } from '@/services/juxt-web/views/common/components/T';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebCommunityItem } from '@/services/juxt-web/views/web/communityListView';
import type { ReactNode } from 'react';
import type { SubCommunityViewProps } from '@/services/juxt-web/views/portal/subCommunityView';

export function WebSubCommunityView(props: SubCommunityViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				<T k="community.related_to" values={{ community: props.community.name }} />
			</h2>
			<WebNavBar selection={2} />
			<div id="toast"></div>
			<WebWrapper className="wide center">
				<div id="popular" className="communities-wrapper">
					{props.subcommunities.map(community => (
						<WebCommunityItem key={community.olive_community_id} community={community} />
					))}
				</div>
			</WebWrapper>
		</WebRoot>
	);
}
