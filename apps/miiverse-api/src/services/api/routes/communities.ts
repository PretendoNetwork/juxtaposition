import express from 'express';
import xmlbuilder from 'xmlbuilder';
import multer from 'multer';
import { z } from 'zod';
import { Post } from '@/models/post';
import { Community } from '@/models/community';
import { getValueFromQueryString } from '@/util';
import {
	getMostPopularCommunities,
	getNewCommunities,
	getCommunityByTitleID,
	getUserContent
} from '@/database';
import { ApiErrorCode, badRequest, serverError } from '@/errors';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';
import type { SubCommunityQuery } from '@/types/mongoose/subcommunity-query';
import type { CommunityPostsQuery } from '@/types/mongoose/community-posts-query';
import type { HydratedPostDocument, IPost } from '@/types/mongoose/post';
import type { ParamPack } from '@/types/common/param-pack';
import type { CommunitiesResult, CommunityPostsResult } from '@/types/miiverse/community';

const createNewCommunitySchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	icon: z.string(),
	app_data: z.string().optional()
});

const router = express.Router();

async function commonGetSubCommunity(paramPack: ParamPack, communityID: string | undefined): Promise<HydratedCommunityDocument | null> {
	const parentCommunity = await getCommunityByTitleID(paramPack.title_id);

	if (!parentCommunity) {
		return null;
	}

	const query = {
		parent: parentCommunity.olive_community_id,
		community_id: communityID
	};

	const community = await Community.findOne(query);

	if (!community) {
		return null;
	}

	return community;
}

/* GET post titles. */
router.get('/', async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const parentCommunity = await getCommunityByTitleID(request.paramPack.title_id);
	if (!parentCommunity) {
		return badRequest(response, ApiErrorCode.NOT_FOUND_COMMUNITY, 404);
	}

	const type = getValueFromQueryString(request.query, 'type')[0];
	const limitString = getValueFromQueryString(request.query, 'limit')[0];

	let limit = 4;

	if (limitString) {
		limit = parseInt(limitString);
	}

	if (isNaN(limit)) {
		limit = 4;
	}

	if (limit > 16) {
		limit = 16;
	}

	const query: SubCommunityQuery = {
		parent: parentCommunity.olive_community_id
	};

	if (type === 'my') {
		query.owner = request.pid;
	} else if (type === 'favorite') {
		query.user_favorites = request.pid;
	}

	const communities = await Community.find(query).limit(limit);

	const result: CommunitiesResult = {
		has_error: 0,
		version: 1,
		request_name: 'communities',
		communities: []
	};

	for (const community of communities) {
		result.communities.push({
			community: community.json()
		});
	}

	response.send(xmlbuilder.create({
		result
	}, {
		separateArrayItems: true
	}).end({
		pretty: true,
		allowEmpty: true
	}));
});

router.get('/popular', async function (_request: express.Request, response: express.Response): Promise<void> {
	const popularCommunities = await getMostPopularCommunities(100);

	response.type('application/json');
	response.send(popularCommunities);
});

router.get('/new', async function (_request: express.Request, response: express.Response): Promise<void> {
	const newCommunities = await getNewCommunities(100);

	response.type('application/json');
	response.send(newCommunities);
});

router.get('/:communityID/posts', async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	let community = await Community.findOne({
		community_id: request.params.communityID
	});

	if (!community) {
		community = await getCommunityByTitleID(request.paramPack.title_id);
	}

	if (!community) {
		return badRequest(response, ApiErrorCode.NOT_FOUND_COMMUNITY, 404);
	}

	const query: CommunityPostsQuery = {
		community_id: community.olive_community_id,
		removed: false,
		app_data: { $ne: null },
		message_to_pid: { $eq: null }
	};

	const searchKey = getValueFromQueryString(request.query, 'search_key')[0];
	const allowSpoiler = getValueFromQueryString(request.query, 'allow_spoiler')[0];
	const postType = getValueFromQueryString(request.query, 'type')[0];
	const queryBy = getValueFromQueryString(request.query, 'by')[0];
	const distinctPID = getValueFromQueryString(request.query, 'distinct_pid')[0];
	const limitString = getValueFromQueryString(request.query, 'limit')[0];
	const withMii = getValueFromQueryString(request.query, 'with_mii')[0];

	let limit = 10;

	if (limitString) {
		limit = parseInt(limitString);
	}

	if (isNaN(limit)) {
		limit = 10;
	}

	if (searchKey) {
		query.search_key = searchKey;
	}

	if (!allowSpoiler) {
		query.is_spoiler = 0;
	}

	// TODO: There probably is a type for text and screenshots too, will have to investigate
	if (postType === 'memo') {
		query.painting = { $ne: null };
	}

	if (queryBy === 'followings') {
		const userContent = await getUserContent(request.pid);

		if (!userContent) {
			request.log.warn(`USER PID ${request.pid} HAS NO USER CONTENT`);
			query.pid = [];
		} else {
			query.pid = userContent.following_users;
		}
	} else if (queryBy === 'self') {
		query.pid = request.pid;
	}

	let posts: HydratedPostDocument[];

	if (distinctPID && distinctPID === '1') {
		const unhydratedPosts = await Post.aggregate<IPost>([
			{ $match: query }, // filter based on input query
			{ $sort: { created_at: -1 } }, // sort by 'created_at' in descending order
			{ $group: { _id: '$pid', doc: { $first: '$$ROOT' } } }, // remove any duplicate 'pid' elements
			{ $replaceRoot: { newRoot: '$doc' } }, // replace the root with the 'doc' field
			{ $limit: limit } // only return the top 10 results
		]);
		posts = unhydratedPosts.map((post: IPost) => Post.hydrate(post));
	} else {
		posts = await Post.find(query).sort({ created_at: -1 }).limit(limit);
	}

	const result: CommunityPostsResult = {
		has_error: 0,
		version: 1,
		request_name: 'posts',
		topic: {
			community_id: community.community_id
		},
		posts: []
	};

	for (const post of posts) {
		result.posts.push({
			post: post.json({
				with_mii: withMii === '1',
				app_data: true,
				topic_tag: true
			})
		});
	}

	response.send(xmlbuilder.create({
		result
	}, {
		separateArrayItems: true
	}).end({
		pretty: true,
		allowEmpty: true
	}));
});

// Handler for POST on '/v1/communities'
router.post('/', multer().none(), async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const parentCommunity = await getCommunityByTitleID(request.paramPack.title_id);
	if (!parentCommunity) {
		return badRequest(response, ApiErrorCode.NOT_FOUND_COMMUNITY, 404);
	}

	// TODO - Better error codes, maybe do defaults?
	const bodyCheck = createNewCommunitySchema.safeParse(request.body);
	if (!bodyCheck.success) {
		request.log.warn('Body failed schema validation');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	if (!request.user) {
		return serverError(response, ApiErrorCode.ACCOUNT_SERVER_ERROR);
	}

	if (request.user.accessLevel < parentCommunity.permissions.minimum_new_community_access_level) {
		return badRequest(response, ApiErrorCode.NOT_ALLOWED, 403);
	}

	request.body.name = request.body.name.trim();
	request.body.icon = request.body.icon.trim();

	if (request.body.description) {
		request.body.description = request.body.description.trim();
	}

	if (request.body.app_data) {
		request.body.app_data = request.body.app_data.trim();
	}

	// Name must be at least 4 character long
	if (request.body.name.length < 4) {
		request.log.warn('Community name too short');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	// Each user can only have 4 subcommunities per title
	const ownedQuery = {
		parent: parentCommunity.olive_community_id,
		owner: request.pid
	};

	const ownedSubcommunityCount = await Community.countDocuments(ownedQuery);
	if (ownedSubcommunityCount >= 4) {
		return badRequest(response, ApiErrorCode.CREATE_TOO_MANY_COMMUNITIES, 403);
	}

	// Each user can only have 16 favorite subcommunities per title
	const favoriteQuery = {
		parent: parentCommunity.olive_community_id,
		user_favorites: request.pid
	};

	const ownedFavoriteCount = await Community.countDocuments(favoriteQuery);
	if (ownedFavoriteCount >= 16) {
		return badRequest(response, ApiErrorCode.CREATE_TOO_MANY_FAVORITES, 403);
	}

	const communitiesCount = await Community.countDocuments();
	const communityID = (parseInt(parentCommunity.community_id) + (5000 * communitiesCount)); // Change this to auto increment
	const community = await Community.create({
		platform_id: 0, // WiiU
		name: request.body.name,
		description: request.body.description || '',
		open: true,
		allows_comments: true,
		type: 1,
		parent: parentCommunity.olive_community_id,
		admins: parentCommunity.admins,
		owner: request.pid,
		icon: request.body.icon,
		title_id: request.paramPack.title_id,
		community_id: communityID.toString(),
		olive_community_id: communityID.toString(),
		app_data: request.body.app_data || '',
		user_favorites: [request.pid]
	});

	response.send(xmlbuilder.create({
		result: {
			has_error: '0',
			version: '1',
			request_name: 'community',
			community: community.json()
		}
	}).end({
		pretty: true,
		allowEmpty: true
	}));
});

router.post('/:community_id.delete', multer().none(), async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const community = await commonGetSubCommunity(request.paramPack, request.params.community_id);

	if (!community) {
		return badRequest(response, ApiErrorCode.NOT_FOUND_COMMUNITY, 404);
	}

	if (community.owner != request.pid) {
		return badRequest(response, ApiErrorCode.NOT_ALLOWED, 403);
	}

	await Community.deleteOne({ _id: community._id });

	response.send(xmlbuilder.create({
		result: {
			has_error: '0',
			version: '1',
			request_name: 'community',
			community: community.json()
		}
	}).end({ pretty: true, allowEmpty: true }));
});

router.post('/:community_id.favorite', multer().none(), async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const community = await commonGetSubCommunity(request.paramPack, request.params.community_id);

	if (!community) {
		return badRequest(response, ApiErrorCode.NOT_FOUND_COMMUNITY, 404);
	}

	// Each user can only have 16 favorite subcommunities per title
	const favoriteQuery = {
		parent: community.parent,
		user_favorites: request.pid
	};

	const ownedFavoriteCount = await Community.countDocuments(favoriteQuery);
	if (ownedFavoriteCount >= 16) {
		return badRequest(response, ApiErrorCode.TOO_MANY_FAVORITES_GAME, 403);
	}

	await community.addUserFavorite(request.pid);

	response.send(xmlbuilder.create({
		result: {
			has_error: '0',
			version: '1',
			request_name: 'community',
			community: community.json()
		}
	}).end({
		pretty: true,
		allowEmpty: true
	}));
});

router.post('/:community_id.unfavorite', multer().none(), async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const community = await commonGetSubCommunity(request.paramPack, request.params.community_id);
	if (!community) {
		return badRequest(response, ApiErrorCode.NOT_FOUND_COMMUNITY, 404);
	}

	// You can't remove from your favorites a community you own
	if (community.owner === request.pid) {
		return badRequest(response, ApiErrorCode.MUST_FAVORITE_OWN_COMMUNITY, 403);
	}

	await community.delUserFavorite(request.pid);

	response.send(xmlbuilder.create({
		result: {
			has_error: '0',
			version: '1',
			request_name: 'community',
			community: community.json()
		}
	}).end({
		pretty: true,
		allowEmpty: true
	}));
});

router.post('/:community_id', multer().none(), async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const community = await commonGetSubCommunity(request.paramPack, request.params.community_id);

	if (!community) {
		return badRequest(response, ApiErrorCode.NOT_FOUND_COMMUNITY, 404);
	}

	if (community.owner != request.pid) {
		return badRequest(response, ApiErrorCode.NOT_ALLOWED, 403);
	}

	if (request.body.name) {
		community.name = request.body.name.trim();
	}

	if (request.body.description) {
		community.description = request.body.description.trim();
	}

	if (request.body.icon) {
		community.icon = request.body.icon.trim();
	}

	if (request.body.app_data) {
		community.app_data = request.body.app_data.trim();
	}

	await community.save();

	response.send(xmlbuilder.create({
		result: {
			has_error: '0',
			version: '1',
			request_name: 'community',
			community: community.json()
		}
	}).end({
		pretty: true,
		allowEmpty: true
	}));
});

export default router;
