import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrCommunityIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrCommunityIcon';
import type { ReactNode } from 'react';
import type { CommunityItemProps, CommunityListViewProps, CommunityOverviewViewProps } from '@/services/juxt-web/views/web/communityListView';

export function CtrCommunityItem(props: CommunityItemProps): ReactNode {
	const id = props.community.olive_community_id;
	return (
		<li id={id}>
			<a href={`/titles/${id}/new`} data-pjax="#body" className="scroll to-community-button">
				<CtrCommunityIcon community={props.community} size="64"></CtrCommunityIcon>
				<div className="body">
					<div className="body-content">
						<span className="community-name title">{props.community.name}</span>
						<br />
						<span className="text">
							{props.community.followerCount}
							{' '}
							<T k="community.followers" />
						</span>
					</div>
				</div>
			</a>
		</li>
	);
}

export function CtrCommunityListView(props: CommunityListViewProps): ReactNode {
	return (
		<CtrRoot title={T.str('all_communities.text')}>
			<CtrPageBody>
				<header id="header">
					<h1 id="page-title"><T k="all_communities.text" /></h1>
				</header>
				<div className="body-content">
					<div className="communities-list">
						<ul className="list-content-with-icon-column" id="community-new-content">
							{props.communities.map(community => (
								<CtrCommunityItem key={community.olive_community_id} community={community} />
							))}
						</ul>
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}

export function CtrCommunityOverviewView(props: CommunityOverviewViewProps): ReactNode {
	return (
		<CtrRoot title={T.str('global.communities')}>
			<CtrPageBody>
				<header
					id="header"
					className="buttons"

					data-toolbar-mode="normal"
					data-toolbar-active-button="3"
				>
					<h1 id="page-title"><T k="global.communities" /></h1>
					<a id="header-communities-button" className="right" href="/titles/all" data-pjax="#body"><T k="all_communities.text" /></a>
				</header>
				<div className="body-content">
					<div className="communities-list">
						<div className="headline">
							<h2><T k="all_communities.popular_places" /></h2>
						</div>
						<ul className="list-content-with-icon-column" id="community-new-content">
							{props.popularCommunities.map(community => (
								<CtrCommunityItem key={community.olive_community_id} community={community} />
							))}
						</ul>
						<div className="headline headline-green">
							<h2><T k="all_communities.new_communities" /></h2>
						</div>
						<ul className="list-content-with-icon-column" id="community-top-content">
							{props.newCommunities.map(community => (
								<CtrCommunityItem key={community.olive_community_id} community={community} />
							))}
						</ul>
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
