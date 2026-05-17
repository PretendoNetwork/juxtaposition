import cx from 'classnames';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { WebPostListClosedView } from '@/services/juxt-web/views/web/postList';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import { WebInfobox, WebInfoboxButton, WebInfoboxButtons, WebInfoboxFollowButton, WebInfoboxStatBoxes } from '@/services/juxt-web/views/web/components/WebInfobox';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { WebCommunityIcon } from '@/services/juxt-web/views/web/components/ui/WebCommunityIcon';
import type { ReactNode } from 'react';
import type { Community } from '@/api/generated';

export type CommunityViewProps = {
	community: Community;
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
	const image = props.community.iconImagePaths['128'];
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
	const user = useUser();
	const community = props.community;
	const bannerUrl = url.cdn(community.wupHeaderImagePath);

	return (
		<WebRoot head={<WebCommunityHead {...props} />}>
			<h2 id="title" className="page-header">
				<T k="global.communities" />
			</h2>
			<WebNavBar selection={2} />
			<div id="toast"></div>
			<WebWrapper className="community-page-post-box">
				<WebInfobox	bannerUrl={bannerUrl}>
					<div className="title-line">
						<WebCommunityIcon community={community} size="128" type="header-icon" />
						<div className="title">{community.name}</div>
						<WebInfoboxFollowButton
							followType="title"
							followId={community.olive_community_id}
							isFollowing={props.isUserFollowing}
						/>
					</div>
					<div className="description">
						{community.description}
					</div>
					<WebInfoboxStatBoxes>
						<div>
							<div className="value" id="followers">{community.followerCount}</div>
							<div className="name"><T k="community.followers" /></div>
						</div>
						<div>
							<div className="value">{props.totalPosts}</div>
							<div className="name"><T k="community.posts" /></div>
						</div>
						<div>
							<div className="value"><T k="community.tags_not_applicable" /></div>
							<div className="name"><T k="community.tags" /></div>
						</div>
					</WebInfoboxStatBoxes>
				</WebInfobox>
				<WebInfoboxButtons>
					{props.hasSubCommunities
						? (
								<WebInfoboxButton href={`/titles/${community.olive_community_id}/related`}>
									<T k="community.related" />
								</WebInfoboxButton>
							)
						: null}
					{user.perms.developer
						? (
								<WebInfoboxButton href={`/admin/communities/${community.olive_community_id}`}>
									Edit Community
								</WebInfoboxButton>
							)
						: null}
				</WebInfoboxButtons>
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
