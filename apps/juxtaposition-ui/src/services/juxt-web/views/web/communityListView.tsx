import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { CommunitySchema } from '@/models/communities';
import type { CommunityDto } from '@/api/community';

export type CommunityListViewProps = {
	ctx: RenderContext;
	communities: CommunityDto[];
};

export type CommunityOverviewViewProps = {
	ctx: RenderContext;
	popularCommunities: InferSchemaType<typeof CommunitySchema>[];
	newCommunities: InferSchemaType<typeof CommunitySchema>[];
};

export type CommunityItemProps = {
	ctx: RenderContext;
	community: CommunityDto | InferSchemaType<typeof CommunitySchema>;
};

function WebCommunityItem(props: CommunityItemProps): ReactNode {
	return (
		<a key={props.community.olive_community_id} className="community-list-wrapper" href={`/titles/${props.community.olive_community_id}/new`}>
			<img className="community-list-icon" src={utils.cdn(props.ctx, `/icons/${props.community.olive_community_id}/128.png`)} />
			<h2 className="community-list-title">{props.community.name}</h2>
			<h4 className="community-list-followers">
				{props.community.followers}
				{' '}
				followers
			</h4>
		</a>
	);
}

export function WebCommunityListView(props: CommunityListViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				{props.ctx.lang.all_communities.text}
			</h2>
			<WebNavBar ctx={props.ctx} selection={2} />
			<div id="toast"></div>
			<WebWrapper>
				<div id="popular" className="communities-wrapper">
					{props.communities.map(community => (
						<WebCommunityItem key={community.olive_community_id} ctx={props.ctx} community={community} />
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
				{props.ctx.lang.global.communities}
			</h2>
			<WebNavBar ctx={props.ctx} selection={2} />
			<div id="toast"></div>
			<WebWrapper>
				<h3 className="communities-header">{props.ctx.lang.all_communities.popular_places}</h3>
				<div id="popular" className="communities-wrapper">
					{props.popularCommunities.map(community => (
						<WebCommunityItem key={community.olive_community_id} ctx={props.ctx} community={community} />
					))}
				</div>
				<h3 className="communities-header">{props.ctx.lang.all_communities.new_communities}</h3>
				<div id="new" className="communities-wrapper">
					{props.newCommunities.map(community => (
						<WebCommunityItem key={community.olive_community_id} ctx={props.ctx} community={community} />
					))}
				</div>
			</WebWrapper>
			<WebWrapper className="bottom">
				<button id="load-more-posts-button" data-offset="20" evt-click="location.href='/titles/all'">{props.ctx.lang.all_communities.text}</button>
			</WebWrapper>
		</WebRoot>
	);
}
