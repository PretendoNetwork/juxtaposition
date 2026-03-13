import cx from 'classnames';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { WebPostListClosedView } from '@/services/juxt-web/views/web/postList';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { CommunitySchema } from '@/models/communities';

export type CommunityViewProps = {
	community: InferSchemaType<typeof CommunitySchema>;
	totalPosts: number;
	canPost: boolean;
	isUserFollowing: boolean;
	hasSubCommunities: boolean;
	feedType: number;
	children?: ReactNode;
};

export function WebCommunityHead(props: CommunityViewProps): ReactNode {
	const url = useUrl();
	const name = props.community.name;
	const title = `Juxt - ${name}`;
	const description = props.community.description;
	const image = url.cdn(`/icons/${props.community.olive_community_id}/128.png`);
	const communityUrl = `https://juxt.pretendo.cc/communities/${props.community.olive_community_id}/new`;

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
			<meta property="og:url" content={communityUrl} />
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
	const url = useUrl();
	const community = props.community;
	const imageId = community.parent ? community.parent : community.olive_community_id;
	const bannerUrl = community.wup_header
		? url.cdn(community.wup_header)
		: url.cdn(`/headers/${imageId}/WiiU.png`);

	return (
		<WebRoot head={<WebCommunityHead {...props} />}>
			<h2 id="title" className="page-header">
				<T k="global.communities" />
			</h2>
			<WebNavBar selection={2} />
			<div id="toast"></div>
			<WebWrapper className="community-page-post-box">
				<div className="community-top">
					<img className="banner" src={bannerUrl} />
					<div className="community-info">
						<img className="user-icon" src={url.cdn(`/icons/${imageId}/128.png`)} />
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
										data-text={props.isUserFollowing ? T.str('user_page.follow_user') : T.str('user_page.following_user')}
									>
										{props.isUserFollowing ? <T k="user_page.following_user" /> : <T k="user_page.follow_user" />}
									</a>
								)
							: null}
					</div>
					<h4 className="community-description">{community.description}</h4>
					<span className="community-page-follow-button-text" id={community.olive_community_id}></span>
					<div className="info-boxes-wrapper">
						<div>
							<h4><T k="community.followers" /></h4>
							<h4 className="community-page-table-text" id="followers">{community.followers}</h4>
						</div>
						<div>
							<h4><T k="community.posts" /></h4>
							<h4>{props.totalPosts}</h4>
						</div>
						<div>
							<h4><T k="community.tags" /></h4>
							<h4><T k="community.tags_not_applicable" /></h4>
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
						<T k="community.recent" />
					</a>
					<a
						id="popular-tab"
						className={cx({
							selected: props.feedType === 1
						})}
						href={`/titles/${community.olive_community_id}/hot`}
					>
						<T k="community.popular" />
					</a>
				</div>
				{!community.permissions.open ? <WebPostListClosedView /> : null}
				{props.children}
			</WebWrapper>
			<WebReportModalView />
		</WebRoot>
	);
}
