import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/components/PortalNavBar';
import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalCommunityIcon } from '@/services/juxt-web/views/portal/components/ui/PortalCommunityIcon';
import { PortalSearchForm } from '@/services/juxt-web/views/portal/components/ui/PortalSearchForm';
import { prepSearchTerm } from '@/services/juxt-web/views/web/components/ui/WebSearchForm';
import { PortalListView, PortalListViewItem } from '@/services/juxt-web/views/portal/components/PortalListView';
import type { ReactNode } from 'react';
import type { CommunityItemProps, CommunityListViewProps, CommunityOverviewViewProps } from '@/services/juxt-web/views/web/communityListView';

export function PortalCommunityItem(props: CommunityItemProps): ReactNode {
	const id = props.community.olive_community_id;
	return (
		<PortalListViewItem
			id={id}
			className="community-list-card"
			data-search-term={prepSearchTerm(props.community.name)}
			href={`/titles/${id}/new`}
		>
			<PortalCommunityIcon community={props.community} size="128" />
			<div className="list-body">
				<span>{props.community.name}</span>
				<div className="community-info">
					{props.community.platform == 'ctr' || props.community.platform == 'both'
						? <span className="platform-dot ctr">{'● '}</span>
						: null}
					{props.community.platform == 'wup' || props.community.platform == 'both'
						? <span className="platform-dot wup">{'● '}</span>
						: null}
					<span className="followers">
						{props.community.followerCount}
						{' '}
						<T k="community.followers" />
					</span>
				</div>
			</div>
		</PortalListViewItem>
	);
}

export function PortalCommunityListView(props: CommunityListViewProps): ReactNode {
	return (
		<PortalRoot title={T.str('all_communities.text')} onLoad="stopLoading();">
			<PortalNavBar selection={2} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title"><T k="all_communities.text" /></h1>
				</header>
				<div className="body-content">
					<div>
						<PortalSearchForm type="box" data-community-list-search="#community-content" />
						<PortalListView type="table-3col" id="community-content">
							{props.communities.map(community => (
								<PortalCommunityItem key={community.olive_community_id} community={community} />
							))}
						</PortalListView>
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}

export function PortalCommunityOverviewView(props: CommunityOverviewViewProps): ReactNode {
	return (
		<PortalRoot title={T.str('global.communities')} onLoad="stopLoading();">
			<PortalNavBar selection={2} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title"><T k="global.communities" /></h1>
					<a id="header-communities-button" href="/titles/all" data-pjax="#body"><T k="all_communities.text" /></a>
				</header>
				<div className="body-content">
					<div className="communities-list">
						<div className="headline">
							<h2><T k="all_communities.popular_places" /></h2>
						</div>
						<PortalListView type="table-3col" id="community-new-content">
							{props.popularCommunities.map(community => (
								<PortalCommunityItem key={community.olive_community_id} community={community} />
							))}
						</PortalListView>
						<div className="headline headline-green">
							<h2><T k="all_communities.new_communities" /></h2>
						</div>
						<PortalListView type="table-3col" id="community-top-content">
							{props.newCommunities.map(community => (
								<PortalCommunityItem key={community.olive_community_id} community={community} />
							))}
						</PortalListView>
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
