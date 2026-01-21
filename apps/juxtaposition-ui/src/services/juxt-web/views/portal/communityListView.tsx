import { utils } from '@/services/juxt-web/views/utils';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import type { ReactNode } from 'react';
import type { CommunityItemProps, CommunityListViewProps, CommunityOverviewViewProps } from '@/services/juxt-web/views/web/communityListView';

export function PortalCommunityItem(props: CommunityItemProps): ReactNode {
	const id = props.community.olive_community_id;
	const imageCommunityId = props.community.parent ? props.community.parent : id;
	return (
		<li id={id}>
			<span className="icon-container"><img src={utils.cdn(props.ctx, `/icons/${imageCommunityId}/128.png`)} className="icon" alt="" /></span>
			<a href={`/titles/${id}/new`} data-pjax="#body" className="scroll to-community-button"></a>
			<div className="body">
				<div className="body-content">
					<span className="community-name title">{props.community.name}</span>
					<span className="text">
						{props.community.followers}
						{' '}
						{props.ctx.lang.community.followers}
					</span>
				</div>
			</div>
		</li>
	);
}

export function PortalCommunityListView(props: CommunityListViewProps): ReactNode {
	return (
		<PortalRoot title={props.ctx.lang.all_communities.text} onLoad="stopLoading();">
			<PortalNavBar ctx={props.ctx} selection={2} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title">{props.ctx.lang.all_communities.text}</h1>
					<a id="header-communities-button" href="/titles/all" data-pjax="#body">{props.ctx.lang.all_communities.text}</a>
				</header>
				<div className="body-content">
					<div className="communities-list">
						<ul className="list-content-with-icon-column" id="community-new-content">
							{props.communities.map(community => (
								<PortalCommunityItem key={community.olive_community_id} ctx={props.ctx} community={community} />
							))}
						</ul>
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}

export function PortalCommunityOverviewView(props: CommunityOverviewViewProps): ReactNode {
	return (
		<PortalRoot title={props.ctx.lang.global.communities} onLoad="stopLoading();">
			<PortalNavBar ctx={props.ctx} selection={2} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title">{props.ctx.lang.global.communities}</h1>
					<a id="header-communities-button" href="/titles/all" data-pjax="#body">{props.ctx.lang.all_communities.text}</a>
				</header>
				<div className="body-content">
					<div className="communities-list">
						<div className="headline">
							<h2>{props.ctx.lang.all_communities.popular_places}</h2>
						</div>
						<ul className="list-content-with-icon-column" id="community-new-content">
							{props.popularCommunities.map(community => (
								<PortalCommunityItem key={community.olive_community_id} ctx={props.ctx} community={community} />
							))}
						</ul>
						<div className="headline headline-green">
							<h2>{props.ctx.lang.all_communities.new_communities}</h2>
						</div>
						<ul className="list-content-with-icon-column" id="community-top-content">
							{props.newCommunities.map(community => (
								<PortalCommunityItem key={community.olive_community_id} ctx={props.ctx} community={community} />
							))}
						</ul>
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
