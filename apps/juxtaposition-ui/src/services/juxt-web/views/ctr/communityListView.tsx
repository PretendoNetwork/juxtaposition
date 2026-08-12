import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrCommunityIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrCommunityIcon';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import { CtrPageButton, CtrPageButtons } from '@/services/juxt-web/views/ctr/components/CtrPageButtons';
import { CtrSearchForm } from '@/services/juxt-web/views/ctr/components/ui/CtrSearchForm';
import { prepSearchTerm } from '@/services/juxt-web/views/web/components/ui/WebSearchForm';
import { CtrListView, CtrListViewItem } from '@/services/juxt-web/views/ctr/components/CtrListView';
import type { ReactNode } from 'react';
import type { CommunityItemProps, CommunityListViewProps, CommunityOverviewViewProps } from '@/services/juxt-web/views/web/communityListView';

export function CtrCommunityItem(props: CommunityItemProps): ReactNode {
	const id = props.community.olive_community_id;
	return (
		<CtrListViewItem id={id} data-search-term={prepSearchTerm(props.community.name)} href={`/titles/${id}/new`}>
			<CtrCommunityIcon community={props.community} size="64"></CtrCommunityIcon>
			<div className="list-body community-list-card">
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
		</CtrListViewItem>
	);
}

export function CtrCommunityListView(props: CommunityListViewProps): ReactNode {
	return (
		<CtrRoot title={T.str('all_communities.text')}>
			<CtrPageBody>
				<CtrPageTitledHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button="3"
				>
					<T k="all_communities.text" />
				</CtrPageTitledHeader>
				<div className="body-content">
					<CtrSearchForm type="box" data-community-list-search="#community-list" />
					<CtrListView type="icon-column" id="community-list">
						{props.communities.map(community => (
							<CtrCommunityItem key={community.olive_community_id} community={community} />
						))}
					</CtrListView>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}

export function CtrCommunityOverviewView(props: CommunityOverviewViewProps): ReactNode {
	return (
		<CtrRoot title={T.str('global.communities')}>
			<CtrPageBody>
				<CtrPageTitledHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button="3"
				>
					<T k="global.communities" />
				</CtrPageTitledHeader>
				<CtrPageButtons>
					<CtrPageButton type="right" href="/titles/all"><T k="all_communities.text" /></CtrPageButton>
				</CtrPageButtons>
				<div className="body-content">
					<div className="headline">
						<h2><T k="all_communities.popular_places" /></h2>
					</div>
					<CtrListView type="icon-column">
						{props.popularCommunities.map(community => (
							<CtrCommunityItem key={community.olive_community_id} community={community} />
						))}
					</CtrListView>
					<div className="headline headline-green">
						<h2><T k="all_communities.new_communities" /></h2>
					</div>
					<CtrListView type="icon-column">
						{props.newCommunities.map(community => (
							<CtrCommunityItem key={community.olive_community_id} community={community} />
						))}
					</CtrListView>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
