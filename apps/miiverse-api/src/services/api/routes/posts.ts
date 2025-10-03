import express from 'express';
import multer from 'multer';
import xmlbuilder from 'xmlbuilder';
import { z } from 'zod';
import {
	getValueFromQueryString,
	getInvalidPostRegex
} from '@/util';
import {
	getPostByID,
	getUserContent,
	getPostReplies,
	getUserSettings,
	getCommunityByID,
	getCommunityByTitleID,
	getDuplicatePosts
} from '@/database';
import { Post } from '@/models/post';
import { Community } from '@/models/community';
import { config } from '@/config';
import { ApiErrorCode, badRequest, serverError } from '@/errors';
import { uploadPainting, uploadScreenshot } from '@/images';
import type { PostRepliesResult } from '@/types/miiverse/post';
import type { HydratedPostDocument, IPostInput } from '@/types/mongoose/post';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';

const newPostSchema = z.object({
	community_id: z.string().optional(),
	app_data: z.string().optional(),
	painting: z.string().optional(),
	screenshot: z.string().optional(),
	body: z.string().optional(),
	feeling_id: z.string(),
	search_key: z.string().array().or(z.string()).optional(),
	topic_tag: z.string().optional(),
	is_autopost: z.string(),
	is_spoiler: z.string().optional(),
	is_app_jumpable: z.string().optional(),
	language_id: z.string()
});

const router = express.Router();
const upload = multer();

/* GET post titles. */
router.post('/', upload.none(), newPost);

router.post('/:post_id/replies', upload.none(), newPost);

router.post('/:post_id.delete', async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const post = await getPostByID(request.params.post_id);
	const userContent = await getUserContent(request.pid);

	if (!post || !userContent) {
		return badRequest(response, ApiErrorCode.FAIL_NOT_FOUND_POST, 404);
	}

	if (post.pid !== userContent.pid) {
		return badRequest(response, ApiErrorCode.NOT_ALLOWED, 403);
	}

	await post.del('User requested removal', request.pid);
	response.sendStatus(200);
});

router.post('/:post_id/empathies', upload.none(), async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const post = await getPostByID(request.params.post_id);

	if (!post) {
		return badRequest(response, ApiErrorCode.FAIL_NOT_FOUND_POST, 404);
	}

	if (post.yeahs?.indexOf(request.pid) === -1) {
		await Post.updateOne({
			id: post.id,
			yeahs: {
				$ne: request.pid
			}
		},
		{
			$inc: {
				empathy_count: 1
			},
			$push: {
				yeahs: request.pid
			}
		});
	} else if (post.yeahs?.indexOf(request.pid) !== -1) {
		await Post.updateOne({
			id: post.id,
			yeahs: {
				$eq: request.pid
			}
		},
		{
			$inc: {
				empathy_count: -1
			},
			$pull: {
				yeahs: request.pid
			}
		});
	}

	response.sendStatus(200);
});

router.get('/:post_id/replies', async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const limitString = getValueFromQueryString(request.query, 'limit')[0];

	let limit = 10; // TODO - Is there a real limit?

	if (limitString) {
		limit = parseInt(limitString);
	}

	if (isNaN(limit)) {
		limit = 10;
	}

	const post = await getPostByID(request.params.post_id);

	if (!post) {
		return badRequest(response, ApiErrorCode.FAIL_NOT_FOUND_POST, 404);
	}

	const posts = await getPostReplies(post.id, limit);
	if (posts.length === 0) {
		request.log.warn('Post has no replies');
		return badRequest(response, ApiErrorCode.FAIL_NOT_FOUND_POST, 404);
	}

	const result: PostRepliesResult = {
		has_error: 0,
		version: 1,
		request_name: 'replies',
		posts: []
	};

	for (const post of posts) {
		result.posts.push({
			post: post.json({
				with_mii: request.query.with_mii as string === '1',
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

router.get('/', async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const postID = getValueFromQueryString(request.query, 'post_id')[0];

	if (!postID) {
		request.log.warn('Post ID wasn\'t provided');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	const post = await getPostByID(postID);

	if (!post) {
		return badRequest(response, ApiErrorCode.FAIL_NOT_FOUND_POST, 404);
	}

	response.send(xmlbuilder.create({
		result: {
			has_error: '0',
			version: '1',
			request_name: 'posts.search',
			posts: {
				post: post.json({ with_mii: true })
			}
		}
	}).end({ pretty: true, allowEmpty: true }));
});

function canPost(community: HydratedCommunityDocument, userSettings: HydratedSettingsDocument, parentPost: HydratedPostDocument | null, user: GetUserDataResponse): boolean {
	const isReply = !!parentPost;
	const isPublicPostableCommunity = community.type >= 0 && community.type < 2;
	const isOpenCommunity = community.permissions.open;

	const isCommunityAdmin = (community.admins ?? []).includes(user.pid);
	const isUserLimitedFromPosting = userSettings.account_status !== 0;
	const hasAccessLevelRequirement = isReply
		? user.accessLevel >= community.permissions.minimum_new_comment_access_level
		: user.accessLevel >= community.permissions.minimum_new_post_access_level;

	if (isUserLimitedFromPosting) {
		return false;
	}

	if (isCommunityAdmin) {
		return true; // admins can always post (if not limited)
	}

	if (!hasAccessLevelRequirement) {
		return false;
	}

	return isReply ? isOpenCommunity : isPublicPostableCommunity;
}

async function newPost(request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	if (!request.user) {
		return serverError(response, ApiErrorCode.ACCOUNT_SERVER_ERROR);
	}

	if (!request.user.mii) {
		// * This should never happen, but TypeScript complains so check anyway
		// TODO - Better errors
		request.log.warn('Mii does not exist or is invalid');
		return serverError(response, ApiErrorCode.ACCOUNT_SERVER_ERROR);
	}

	const userSettings = await getUserSettings(request.pid);
	const bodyCheck = newPostSchema.safeParse(request.body);

	if (!userSettings || !bodyCheck.success) {
		request.log.warn('Body check failed');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	const communityID = bodyCheck.data.community_id || '';
	const messageBody = bodyCheck.data.body?.trim();
	const painting = bodyCheck.data.painting?.replace(/\0/g, '').trim() || '';
	const screenshot = bodyCheck.data.screenshot?.replace(/\0/g, '').trim() || '';
	const appData = bodyCheck.data.app_data?.replace(/[^A-Za-z0-9+/=\s]/g, '').trim() || '';
	const feelingID = parseInt(bodyCheck.data.feeling_id);
	let searchKey = bodyCheck.data.search_key || [];
	const topicTag = bodyCheck.data.topic_tag || '';
	const autopost = bodyCheck.data.is_autopost;
	const spoiler = bodyCheck.data.is_spoiler;
	const jumpable = bodyCheck.data.is_app_jumpable;
	const languageID = parseInt(bodyCheck.data.language_id);
	const countryID = parseInt(request.paramPack.country_id);
	const platformID = parseInt(request.paramPack.platform_id);
	const regionID = parseInt(request.paramPack.region_id);

	if (
		isNaN(feelingID) ||
		isNaN(languageID) ||
		isNaN(countryID) ||
		isNaN(platformID) ||
		isNaN(regionID)
	) {
		request.log.warn('Parameters are NaN');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	let community = await getCommunityByID(communityID);
	if (!community) {
		community = await Community.findOne({
			olive_community_id: communityID
		});
	}

	if (!community) {
		community = await getCommunityByTitleID(request.paramPack.title_id);
	}

	if (!community || userSettings.account_status !== 0 || community.community_id === 'announcements') {
		return badRequest(response, ApiErrorCode.NOT_FOUND_COMMUNITY, 404);
	}

	let parentPost: HydratedPostDocument | null = null;
	if (request.params.post_id) {
		parentPost = await getPostByID(request.params.post_id.toString());

		if (!parentPost) {
			request.log.warn('Request missing parent post');
			return badRequest(response, ApiErrorCode.BAD_PARAMS);
		}
	}

	if (!canPost(community, userSettings, parentPost, request.user)) {
		return badRequest(response, ApiErrorCode.NOT_ALLOWED, 403);
	}

	let miiFace = 'normal_face.png';
	switch (parseInt(request.body.feeling_id)) {
		case 1:
			miiFace = 'smile_open_mouth.png';
			break;
		case 2:
			miiFace = 'wink_left.png';
			break;
		case 3:
			miiFace = 'surprise_open_mouth.png';
			break;
		case 4:
			miiFace = 'frustrated.png';
			break;
		case 5:
			miiFace = 'sorrow.png';
			break;
	}

	if (messageBody && getInvalidPostRegex().test(messageBody)) {
		request.log.warn('Message body failed regex');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	if (messageBody && messageBody.length > 280) {
		request.log.warn('Message body too long');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	if (!messageBody && !painting && !screenshot) {
		request.log.warn('Message content is empty');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	if (!Array.isArray(searchKey)) {
		searchKey = [searchKey];
	}

	const document: IPostInput = {
		id: '', // * This gets changed when saving the document for the first time
		title_id: request.paramPack.title_id,
		community_id: community.olive_community_id,
		screen_name: userSettings.screen_name,
		body: messageBody ? messageBody : '',
		app_data: appData,
		painting: '',
		screenshot: '',
		screenshot_thumb: '',
		screenshot_aspect: '',
		screenshot_length: 0,
		country_id: countryID,
		created_at: new Date(),
		feeling_id: feelingID,
		search_key: searchKey,
		topic_tag: topicTag,
		is_autopost: (autopost) ? 1 : 0,
		is_spoiler: (spoiler === '1') ? 1 : 0,
		is_app_jumpable: (jumpable) ? 1 : 0,
		language_id: languageID,
		mii: request.user.mii.data,
		mii_face_url: `${config.cdnUrl}/mii/${request.user.pid}/${miiFace}`,
		pid: request.pid,
		platform_id: platformID,
		region_id: regionID,
		verified: (request.user.accessLevel === 2 || request.user.accessLevel === 3),
		parent: parentPost ? parentPost.id : null,
		removed: false
	};

	const duplicatePost = await getDuplicatePosts(request.pid, document);

	if (duplicatePost) {
		return badRequest(response, ApiErrorCode.NOT_ALLOWED_SPAM, 403);
	}

	const post = await Post.create(document);

	if (painting) {
		const paintingBlob = await uploadPainting({
			blob: painting,
			autodetectFormat: true,
			isBmp: false,
			pid: post.pid,
			postId: post.id
		});
		if (paintingBlob === null) {
			// The document we already submitted to the db is invalid, so drop it.
			post.deleteOne();
			return serverError(response, ApiErrorCode.DATABASE_ERROR);
		}

		post.painting = paintingBlob;
	}

	if (screenshot) {
		const screenshotUrls = await uploadScreenshot({
			blob: screenshot,
			pid: post.pid,
			postId: post.id
		});
		if (screenshotUrls === null) {
			// The document we already submitted to the db is invalid, so drop it.
			post.deleteOne();
			return serverError(response, ApiErrorCode.DATABASE_ERROR);
		}

		post.screenshot = screenshotUrls.full;
		post.screenshot_length = screenshotUrls.fullLength;
		post.screenshot_thumb = screenshotUrls.thumb;
		post.screenshot_aspect = screenshotUrls.aspect;
	}

	if (post.isModified()) {
		await post.save();
	}

	if (parentPost) {
		parentPost.reply_count = (parentPost.reply_count || 0) + 1;
		parentPost.save();
	}

	response.send(xmlbuilder.create({
		result: {
			has_error: '0',
			version: '1',
			post: {
				post: post.json({ with_mii: true })
			}
		}
	}).end({ pretty: true, allowEmpty: true }));
}

export default router;
