import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { Community } from '@/api/generated';

export type CommunityListViewProps = {
	communities: Community[];
};

export type CommunityOverviewViewProps = {
	popularCommunities: Community[];
	newCommunities: Community[];
};

export type CommunityItemProps = {
	community: Community;
};

function WebCommunityItem(props: CommunityItemProps): ReactNode {
	const url = useUrl();
	return (
		<a key={props.community.olive_community_id} className="community-list-wrapper" href={`/titles/${props.community.olive_community_id}/new`}>
			<img className="community-list-icon" src={url.cdn(`/icons/${props.community.olive_community_id}/128.png`)} />
			<h2 className="community-list-title">{props.community.name}</h2>
			<p className="community-list-followers">
				<T k="community.followers_count" values={{ count: props.community.followerCount }} />
			</p>
		</a>
	);
}

export function WebCommunityListView(props: CommunityListViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				<T k="all_communities.text" />
			</h2>
			<WebNavBar selection={2} />
			<div id="toast"></div>
			<WebWrapper>
				<div id="popular" className="communities-wrapper">
					{props.communities.map(community => (
						<WebCommunityItem key={community.olive_community_id} community={community} />
					))}
				</div>
			</WebWrapper>
		</WebRoot>
	);
}

export function WebCommunityOverviewView(props: CommunityOverviewViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				<T k="global.communities" />
			</h2>
			<WebNavBar selection={2} />
			<div id="toast"></div>
			<WebWrapper>
				<h3 className="communities-header"><T k="all_communities.popular_places" /></h3>
				<div id="popular" className="communities-wrapper">
					{props.popularCommunities.map(community => (
						<WebCommunityItem key={community.olive_community_id} community={community} />
					))}
				</div>
				<h3 className="communities-header"><T k="all_communities.new_communities" /></h3>
				<div id="new" className="communities-wrapper">
					{props.newCommunities.map(community => (
						<WebCommunityItem key={community.olive_community_id} community={community} />
					))}
				</div>
			</WebWrapper>
			<WebWrapper className="bottom">
				<button id="load-more-posts-button" data-offset="20" evt-click="location.href='/titles/all'"><T k="all_communities.text" /></button>
			</WebWrapper>
		</WebRoot>
	);
}
