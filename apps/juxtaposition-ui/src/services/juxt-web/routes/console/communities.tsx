import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { config } from '@/config';
import { database } from '@/database';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebCommunityListView, WebCommunityOverviewView } from '@/services/juxt-web/views/web/communityListView';
import { PortalCommunityListView, PortalCommunityOverviewView } from '@/services/juxt-web/views/portal/communityListView';
import { CtrCommunityListView, CtrCommunityOverviewView } from '@/services/juxt-web/views/ctr/communityListView';
import { PortalSubCommunityView } from '@/services/juxt-web/views/portal/subCommunityView';
import { CtrSubCommunityView } from '@/services/juxt-web/views/ctr/subCommunityView';
import { WebCommunityView } from '@/services/juxt-web/views/web/communityView';
import { PortalCommunityView } from '@/services/juxt-web/views/portal/communityView';
import { CtrCommunityView } from '@/services/juxt-web/views/ctr/communityView';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import { PortalPostListView } from '@/services/juxt-web/views/portal/postList';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import { zodFallback } from '@/util';
import { CtrNewPostPage } from '@/services/juxt-web/views/ctr/newPostView';
import { PortalNewPostPage } from '@/services/juxt-web/views/portal/newPostView';
import { getShotMode, isPostingAllowed } from '@/services/juxt-web/routes/permissions';
import { Community } from '@/models/communities';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';
import type { CommunityViewProps } from '@/services/juxt-web/views/web/communityView';
import type { SubCommunityViewProps } from '@/services/juxt-web/views/portal/subCommunityView';
import type { CommunityListViewProps, CommunityOverviewViewProps } from '@/services/juxt-web/views/web/communityListView';
import type { Post } from '@/api/generated';

const upload = multer({ dest: 'uploads/' });
export const communitiesRouter = express.Router();

communitiesRouter.get('/', async function (req, res) {
	const popular = await req.api.communities.listPopular({ limit: 9 });
	const recent = await req.api.communities.list({ category: 'listed', limit: 6, sort: 'newest' });

	const props: CommunityOverviewViewProps = {
		newCommunities: recent.data.items,
		popularCommunities: popular.data.items
	};
	res.jsxForDirectory({
		web: <WebCommunityOverviewView {...props} />,
		portal: <PortalCommunityOverviewView {...props} />,
		ctr: <CtrCommunityOverviewView {...props} />
	});
});

communitiesRouter.get('/all', async function (req, res) {
	const communities = await req.api.communities.list({ category: 'listed', limit: 90 });

	const props: CommunityListViewProps = {
		communities: communities.data.items
	};
	res.jsxForDirectory({
		web: <WebCommunityListView {...props} />,
		portal: <PortalCommunityListView {...props} />,
		ctr: <CtrCommunityListView {...props} />
	});
});

communitiesRouter.get('/:communityID', async function (req, res) {
	const { query, params, auth } = parseReq(req, {
		query: z.object({
			title_id: z.string().optional()
		}),
		params: z.object({
			communityID: z.string().regex(/^[0-9]+$/).or(zodFallback(null))
		})
	});

	if (query.title_id) {
		const { data: community } = await req.api.communities.get({ id: `tid:${query.title_id}` });
		if (!community) {
			return res.redirect('/404');
		}
		return res.redirect(`/titles/${community.olive_community_id}/new`);
	}

	if (params.communityID == '0') {
		const tid = auth().paramPackData?.title_id;
		if (!tid) {
			return res.redirect('/404');
		}
		const { data: community } = await req.api.communities.get({ id: `tid:${tid}` });
		if (!community) {
			return res.redirect('/404');
		}
		return res.redirect(`/titles/${community.olive_community_id}/new`);
	}

	if (!params.communityID) {
		return res.redirect('/404');
	}
	return res.redirect(`/titles/${params.communityID}/new`);
});

communitiesRouter.get('/:communityID/related', async function (req, res) {
	const { params, auth } = parseReq(req, {
		params: z.object({
			communityID: z.string()
		})
	});

	if (!auth().self.hasDoneOnboarding) {
		return res.redirect('/404');
	}
	const { data: community } = await req.api.communities.get({ id: params.communityID });
	if (!community) {
		return res.renderError({
			code: 404,
			message: 'Community not Found'
		});
	}
	const { data: subCommunities } = await req.api.communities.list({ category: 'sub', limit: 90, parent_id: community.olive_community_id });
	const children = subCommunities.items;
	if (!children) {
		return res.redirect(`/titles/${community.olive_community_id}/new`);
	}

	const props: SubCommunityViewProps = {
		community,
		subcommunities: children
	};
	res.jsxForDirectory({
		portal: <PortalSubCommunityView {...props} />,
		ctr: <CtrSubCommunityView {...props} />
	});
});

communitiesRouter.get('/:communityID/create', async function (req, res) {
	const { params, auth } = parseReq(req, {
		params: z.object({
			communityID: z.string()
		})
	});

	const { data: community } = await req.api.communities.get({ id: params.communityID });
	if (!community) {
		return res.sendStatus(404);
	}

	const shotMode = getShotMode(community, auth().paramPackData);

	const props = {
		id: community.olive_community_id,
		name: community.name,
		url: `/posts/new`,
		show: 'post',
		shotMode,
		community
	};
	res.jsxForDirectory({
		ctr: <CtrNewPostPage {...props} />,
		portal: <PortalNewPostPage {...props} />
	});
});

communitiesRouter.get('/:communityID/:type', async function (req, res) {
	const { query, params, hasAuth, auth } = parseReq(req, {
		params: z.object({
			communityID: z.string(),
			type: z.string()
		}),
		query: z.object({
			pjax: z.stringbool().optional()
		})
	});

	const self = hasAuth() ? auth().self : null;
	if (self && !self.hasDoneOnboarding) {
		return res.redirect('/404');
	}
	const { data: community } = await req.api.communities.get({ id: params.communityID });
	if (!community) {
		return res.renderError({
			code: 404,
			message: 'Community not Found'
		});
	}
	const { data: communityStats } = await req.api.communities.getStats({ id: community?.olive_community_id });
	if (!communityStats) {
		throw new Error('Community stats could not be found');
	}

	const canPost = !!self && isPostingAllowed(community, self, null);
	const isUserFollowing = !!self && self.content.followed_communities.includes(community.olive_community_id);

	const { data: subCommunitiesList } = await req.api.communities.list({ category: 'sub', limit: 90, parent_id: community.olive_community_id });
	const subCommunities = subCommunitiesList.items;
	let posts: Post[] = [];
	let type: number = 0;

	if (params.type === 'hot') {
		const pageResult = await req.api.communities.feed.getPopular({ id: community.olive_community_id, limit: config.postLimit });
		posts = pageResult.data.items;
		type = 1;
	} else {
		const pageResult = await req.api.communities.feed.getFresh({ id: community.olive_community_id, limit: config.postLimit });
		posts = pageResult.data.items;
		type = 0;
	}

	const postListProps: PostListViewProps = {
		nextLink: `/titles/${params.communityID}/${params.type}/more?offset=${posts.length}&pjax=true`,
		posts,
		userContent: self?.content ?? null
	};

	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView {...postListProps} />,
			portal: <PortalPostListView {...postListProps} />,
			ctr: <CtrPostListView {...postListProps} />
		});
	}

	const props: CommunityViewProps = {
		feedType: type,
		community,
		hasSubCommunities: subCommunities.length > 0,
		totalPosts: communityStats.totalPosts,
		canPost,
		isUserFollowing
	};
	res.jsxForDirectory({
		web: (
			<WebCommunityView {...props}>
				<WebPostListView {...postListProps} />
			</WebCommunityView>
		),
		portal: (
			<PortalCommunityView {...props}>
				<PortalPostListView {...postListProps} />
			</PortalCommunityView>
		),
		ctr: (
			<CtrCommunityView {...props}>
				<CtrPostListView {...postListProps} />
			</CtrCommunityView>
		)
	});
});

communitiesRouter.get('/:communityID/:type/more', async function (req, res) {
	const { query, params, auth, hasAuth } = parseReq(req, {
		params: z.object({
			communityID: z.string(),
			type: z.string()
		}),
		query: z.object({
			offset: z.coerce.number().optional().default(0)
		})
	});

	const offset = query.offset;
	const userContent = hasAuth() ? auth().self.content : null;
	const { data: community } = await req.api.communities.get({ id: params.communityID });
	if (!community || !userContent) {
		return res.redirect('/404');
	}

	let posts: Post[] = [];
	if (params.type === 'hot') {
		const pageResult = await req.api.communities.feed.getPopular({ id: community.olive_community_id, limit: config.postLimit, offset });
		posts = pageResult.data.items;
	} else {
		const pageResult = await req.api.communities.feed.getFresh({ id: community.olive_community_id, limit: config.postLimit, offset });
		posts = pageResult.data.items;
	}

	const postListProps: PostListViewProps = {
		nextLink: `/titles/${params.communityID}/${params.type}/more?offset=${offset + posts.length}&pjax=true`,
		posts,
		userContent
	};

	if (posts.length === 0) {
		return res.sendStatus(204);
	}

	return res.jsxForDirectory({
		web: <WebPostListView {...postListProps} />,
		portal: <PortalPostListView {...postListProps} />,
		ctr: <CtrPostListView {...postListProps} />
	});
});

communitiesRouter.post('/follow', upload.none(), async function (req, res) {
	const { body, auth } = parseReq(req, {
		body: z.object({
			id: z.string()
		})
	});

	const { data: community } = await req.api.communities.get({ id: body.id });
	const userContent = await database.getUserContent(auth().pid);

	if (!userContent || !community) {
		res.send({ status: 423, id: community?.olive_community_id, count: community?.followerCount });
		return;
	}
	const dbCommunity = await Community.findOne({ olive_community_id: community.olive_community_id });
	if (!dbCommunity) {
		throw new Error('Community gone after request');
	}

	// Pretty terrible use of `any` here, but database models aren't typed yet so I have to
	const userFollowsCommunity = userContent.followed_communities.includes(community.olive_community_id);
	if (!userFollowsCommunity) {
		dbCommunity.upFollower();
		(userContent as any).addToCommunities(community.olive_community_id);
	} else {
		dbCommunity.downFollower();
		(userContent as any).removeFromCommunities(community.olive_community_id);
	}

	res.send({ status: 200, id: community.olive_community_id, count: community.followerCount });
});
