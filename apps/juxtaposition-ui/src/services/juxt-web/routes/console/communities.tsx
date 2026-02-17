import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { config } from '@/config';
import { database } from '@/database';
import { COMMUNITY } from '@/models/communities';
import { POST } from '@/models/post';
import { redisGet, redisRemove, redisSet } from '@/redisCache';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebCommunityListView, WebCommunityOverviewView } from '@/services/juxt-web/views/web/communityListView';
import { buildContext } from '@/services/juxt-web/views/context';
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
import { listCommunities, listSubcommunities } from '@/api/community';
import type { InferSchemaType } from 'mongoose';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';
import type { CommunityViewProps } from '@/services/juxt-web/views/web/communityView';
import type { SubCommunityViewProps } from '@/services/juxt-web/views/portal/subCommunityView';
import type { CommunityListViewProps, CommunityOverviewViewProps } from '@/services/juxt-web/views/web/communityListView';
import type { CommunitySchema } from '@/models/communities';
const upload = multer({ dest: 'uploads/' });
export const communitiesRouter = express.Router();

communitiesRouter.get('/', async function (req, res) {
	const communityStats = await getCommunityStats();

	const props: CommunityOverviewViewProps = {
		ctx: buildContext(res),
		newCommunities: communityStats.new,
		popularCommunities: communityStats.popular
	};
	res.jsxForDirectory({
		web: <WebCommunityOverviewView {...props} />,
		portal: <PortalCommunityOverviewView {...props} />,
		ctr: <CtrCommunityOverviewView {...props} />
	});
});

communitiesRouter.get('/all', async function (req, res) {
	const communities = await listCommunities(req.tokens, { limit: 90 });

	const props: CommunityListViewProps = {
		ctx: buildContext(res),
		communities: communities?.items ?? []
	};
	res.jsxForDirectory({
		web: <WebCommunityListView {...props} />,
		portal: <PortalCommunityListView {...props} />,
		ctr: <CtrCommunityListView {...props} />
	});
});

communitiesRouter.get('/:communityID', async function (req, res) {
	const { query, params } = parseReq(req, {
		query: z.object({
			title_id: z.string().optional()
		}),
		params: z.object({
			communityID: z.string().regex(/^[0-9]+$/).or(zodFallback(null))
		})
	});

	if (query.title_id) {
		const community = await database.getCommunityByTitleID(query.title_id);
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

	const userSettings = await database.getUserSettings(auth().pid);
	const userContent = await database.getUserContent(auth().pid);
	if (!userContent || !userSettings) {
		return res.redirect('/404');
	}
	const community = await database.getCommunityByID(params.communityID);
	if (!community) {
		return res.renderError({
			code: 404,
			message: 'Community not Found'
		});
	}
	const children = await listSubcommunities(req.tokens, community.olive_community_id, { limit: 90 });
	if (!children || children.items.length === 0) {
		return res.redirect(`/titles/${community.olive_community_id}/new`);
	}

	const props: SubCommunityViewProps = {
		ctx: buildContext(res),
		community,
		subcommunities: children.items
	};
	res.jsxForDirectory({
		portal: <PortalSubCommunityView {...props} />,
		ctr: <CtrSubCommunityView {...props} />
	});
});

communitiesRouter.get('/:communityID/:type', async function (req, res) {
	const { query, params, auth } = parseReq(req, {
		params: z.object({
			communityID: z.string(),
			type: z.string()
		}),
		query: z.object({
			pjax: z.stringbool().optional()
		})
	});

	const userSettings = await database.getUserSettings(auth().pid);
	const userContent = await database.getUserContent(auth().pid);
	if (!userContent || !userSettings) {
		return res.redirect('/404');
	}
	const community = await database.getCommunityByID(params.communityID);
	if (!community) {
		return res.renderError({
			code: 404,
			message: 'Community not Found'
		});
	}

	if (!community.permissions) {
		community.permissions = {
			open: community.open,
			minimum_new_post_access_level: 0,
			minimum_new_comment_access_level: 0,
			minimum_new_community_access_level: 0
		};
		await community.save();
	}
	const canPost = (
		(community.permissions.open && community.type < 2) ||
		(community.admins && community.admins.indexOf(auth().pid) !== -1) ||
		(auth().user.accessLevel >= community.permissions.minimum_new_post_access_level)
	) && userSettings.account_status === 0;
	const isUserFollowing = userContent.followed_communities.includes(community.olive_community_id);

	const subCommunities = await listSubcommunities(req.tokens, community.olive_community_id, { limit: 1 });
	let posts;
	let type;

	if (params.type === 'hot') {
		posts = await database.getNumberPopularCommunityPostsByID(community, config.postLimit);
		type = 1;
	} else if (params.type === 'verified') {
		posts = await database.getNumberVerifiedCommunityPostsByID(community, config.postLimit);
		type = 2;
	} else {
		posts = await database.getNewPostsByCommunity(community, config.postLimit);
		type = 0;
	}
	const numPosts = await database.getTotalPostsByCommunity(community);

	const postListProps: PostListViewProps = {
		ctx: buildContext(res),
		nextLink: `/titles/${params.communityID}/${params.type}/more?offset=${posts.length}&pjax=true`,
		posts,
		userContent
	};

	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView {...postListProps} />,
			portal: <PortalPostListView {...postListProps} />,
			ctr: <CtrPostListView {...postListProps} />
		});
	}

	const props: CommunityViewProps = {
		ctx: buildContext(res),
		feedType: type,
		community,
		hasSubCommunities: (subCommunities?.items ?? []).length > 0,
		totalPosts: numPosts,
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
	const { query, params, auth } = parseReq(req, {
		params: z.object({
			communityID: z.string(),
			type: z.string()
		}),
		query: z.object({
			offset: z.coerce.number().optional().default(0)
		})
	});

	const offset = query.offset;
	const userContent = await database.getUserContent(auth().pid);
	let posts;
	const community = await database.getCommunityByID(params.communityID);
	if (!community || !userContent) {
		return res.redirect('/404');
	}
	switch (params.type) {
		case 'hot':
			posts = await database.getNumberPopularCommunityPostsByID(community, config.postLimit, offset);
			break;
		case 'verified':
			posts = await database.getNumberVerifiedCommunityPostsByID(community, config.postLimit, offset);
			break;
		default:
			posts = await database.getNewPostsByCommunity(community, config.postLimit, offset);
			break;
	}

	const postListProps: PostListViewProps = {
		ctx: buildContext(res),
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

	const community = await database.getCommunityByID(body.id);
	const userContent = await database.getUserContent(auth().pid);

	if (!userContent || !community) {
		res.send({ status: 423, id: community?.olive_community_id, count: community?.followers });
		return;
	}

	// Pretty terrible use of `any` here, but database models aren't typed yet so I have to
	const userFollowsCommunity = userContent.followed_communities.includes(community.olive_community_id);
	if (!userFollowsCommunity) {
		(community as any).upFollower();
		(userContent as any).addToCommunities(community.olive_community_id);
	} else {
		(community as any).downFollower();
		(userContent as any).removeFromCommunities(community.olive_community_id);
	}

	await redisRemove('popularCommunities'); // Force cache to refresh
	res.send({ status: 200, id: community.olive_community_id, count: community.followers });
});

type CommunityStats = {
	popular: InferSchemaType<typeof CommunitySchema>[];
	new: InferSchemaType<typeof CommunitySchema>[];
};

async function getCommunityStats(): Promise<CommunityStats> {
	const cachedRedisPopularCommunities = await redisGet('popularCommunities');
	let popularCommunities: InferSchemaType<typeof CommunitySchema>[] | null = cachedRedisPopularCommunities ? JSON.parse(cachedRedisPopularCommunities) : null;
	if (popularCommunities == null) {
		const last24Hours = await calculateMostPopularCommunities();
		popularCommunities = await COMMUNITY.aggregate([
			{ $match: { olive_community_id: { $in: last24Hours }, parent: null } },
			{
				$addFields: {
					index: { $indexOfArray: [last24Hours, '$olive_community_id'] }
				}
			},
			{ $sort: { index: 1 } },
			{ $limit: 9 },
			{ $project: { index: 0, _id: 0 } }
		]);
		await redisSet('popularCommunities', JSON.stringify(popularCommunities), 60 * 60);
	}

	const cachedRedisNewCommunities = await redisGet('newCommunities');
	let newCommunities: InferSchemaType<typeof CommunitySchema>[] = cachedRedisNewCommunities ? JSON.parse(cachedRedisNewCommunities) : null;
	if (newCommunities == null) {
		newCommunities = await database.getNewCommunities(6);
		await redisSet('newCommunities', JSON.stringify(newCommunities), 60 * 60);
	}

	return {
		popular: popularCommunities,
		new: newCommunities
	};
}

async function calculateMostPopularCommunities(): Promise<string[]> {
	const now = new Date();
	const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	const posts = await POST.find({ created_at: { $gte: last24Hours }, message_to_pid: null }).lean();

	const communityIds: Record<string, number> = {};
	for (const post of posts) {
		const communityId = post.community_id;
		if (!communityId) {
			continue;
		}

		communityIds[communityId] ??= 0;
		communityIds[communityId] += 1;
	}
	return Object.entries(communityIds)
		.sort((a, b) => b[1] - a[1])
		.map(entry => entry[0]);
}
