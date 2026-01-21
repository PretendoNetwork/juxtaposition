import cx from 'classnames';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { utils } from '@/services/juxt-web/views/utils';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { CommunitySchema } from '@/models/communities';

export type CommunityViewProps = {
	ctx: RenderContext;
	community: InferSchemaType<typeof CommunitySchema>;
	totalPosts: number;
	canPost: boolean;
	isUserFollowing: boolean;
	hasSubCommunities: boolean;
	feedType: number;
	children?: ReactNode;
};

export function WebCommunityHead(props: CommunityViewProps): ReactNode {
	const name = props.community.name;
	const title = `Juxt - ${name}`;
	const description = props.community.description;
	const image = utils.cdn(props.ctx, `/icons/${props.community.olive_community_id}/128.png`);
	const url = `https://juxt.pretendo.cc/communities/${props.community.olive_community_id}/new`;

	return (
		<>
			<title>{title}</title>
			{/* Google / Search Engine Tags */}
			<meta itemProp="name" content={title} />
			<meta itemProp="description" content={description} />
			<meta itemProp="image" content={image} />

			{/* Open Graph Meta Tags */}
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={url} />
			<meta property="og:image" content={image} />
			<meta property="og:site_name" content="Juxtaposition" />

			{/* Twitter Meta Tags */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:site" content="@PretendoNetwork" />
			<meta name="twitter:image" content={image} />
			<meta name="twitter:creator" content="@PretendoNetwork" />
		</>
	);
}

export function WebCommunityView(props: CommunityViewProps): ReactNode {
	const community = props.community;
	const imageId = community.parent ? community.parent : community.olive_community_id;
	const bannerUrl = community.wup_header
		? utils.cdn(props.ctx, community.wup_header)
		: utils.cdn(props.ctx, `/headers/${imageId}/WiiU.png`);

	return (
		<WebRoot head={<WebCommunityHead {...props} />}>
			<h2 id="title" className="page-header">
				{props.ctx.lang.global.communities}
			</h2>
			<WebNavBar ctx={props.ctx} selection={2} />
			<div id="toast"></div>
			<WebWrapper className="community-page-post-box">
				<div className="community-top">
					<img className="banner" src={bannerUrl} />
					<div className="community-info">
						<img className="user-icon" src={utils.cdn(props.ctx, `/icons/${imageId}/128.png`)} />
						<h2 className="community-title">{community.name}</h2>
						{community.permissions.open
							? (
									<a
										href="#"
										className={cx('favorite-button', {
											checked: props.isUserFollowing
										})}
										evt-click="follow(this)"
										data-sound="SE_WAVE_CHECKBOX_UNCHECK"
										data-url="/titles/follow"
										data-community-id={community.olive_community_id}
										data-text={props.isUserFollowing ? props.ctx.lang.user_page.follow_user : props.ctx.lang.user_page.following_user}
									>
										{props.isUserFollowing ? props.ctx.lang.user_page.following_user : props.ctx.lang.user_page.follow_user}
									</a>
								)
							: null}
					</div>
					<h4 className="community-description">{community.description}</h4>
					<span className="community-page-follow-button-text" id={community.olive_community_id}></span>
					<div className="info-boxes-wrapper">
						<div>
							<h4>{props.ctx.lang.community.followers}</h4>
							<h4 className="community-page-table-text" id="followers">{community.followers}</h4>
						</div>
						<div>
							<h4>{props.ctx.lang.community.posts}</h4>
							<h4>{props.totalPosts}</h4>
						</div>
						<div>
							<h4>{props.ctx.lang.community.tags}</h4>
							<h4>N/A</h4>
						</div>
					</div>
				</div>
				<div className="buttons tabs">
					<a
						id="recent-tab"
						className={cx({
							selected: props.feedType === 0
						})}
						href={`/titles/${community.olive_community_id}/new`}
					>
						{props.ctx.lang.community.recent}
					</a>
					<a
						id="popular-tab"
						className={cx({
							selected: props.feedType === 1
						})}
						href={`/titles/${community.olive_community_id}/hot`}
					>
						{props.ctx.lang.community.popular}
					</a>
				</div>
				{props.children}
			</WebWrapper>
			<WebReportModalView ctx={props.ctx} />
		</WebRoot>
	);
}
