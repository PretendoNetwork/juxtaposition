import crypto from 'crypto';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';
import { deletePostById, getPostById, getPostsByParentId } from '@/api/post';
import { config } from '@/config';
import { database } from '@/database';
import { uploadPainting, uploadScreenshot } from '@/images';
import { logger } from '@/logger';
import { POST } from '@/models/post';
import { REPORT } from '@/models/report';
import { redisRemove } from '@/redisCache';
import { createLogEntry, getInvalidPostRegex, getUserAccountData } from '@/util';
import { addEmpathyById, removeEmpathyById } from '@/api/empathy';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { buildContext } from '@/services/juxt-web/views/context';
import { WebPostPageView } from '@/services/juxt-web/views/web/postPageView';
import { CtrPostPageView } from '@/services/juxt-web/views/ctr/postPageView';
import { PortalPostPageView } from '@/services/juxt-web/views/portal/postPageView';
import type { Request, Response } from 'express';
import type { InferSchemaType } from 'mongoose';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { PaintingUrls } from '@/images';
import type { PostPageViewProps } from '@/services/juxt-web/views/web/postPageView';
import type { PostSchema } from '@/models/post';
import type { CommunitySchema } from '@/models/communities';
import type { HydratedSettingsDocument } from '@/models/settings';
import type { ContentSchema } from '@/models/content';
const upload = multer({ dest: 'uploads/' });
export const postsRouter = express.Router();

const postLimit = rateLimit({
	windowMs: 15 * 1000, // 30 seconds
	max: 10, // Limit each IP to 1 request per `window`
	standardHeaders: true,
	legacyHeaders: true,
	message: 'New post limit reached. Try again in a minute',
	handler: function (req, res) {
		if (req.params.post_id) {
			res.redirect('/posts/' + req.params.post_id.toString());
		} else if (req.body.community_id) {
			res.redirect('/titles/' + req.body.community_id);
		} else {
			return res.renderError({
				code: 429,
				message: 'Too many new posts have been created.'
			});
		}
	}
});

const yeahLimit = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // Limit each IP to 60 requests per `window`
	standardHeaders: true,
	legacyHeaders: true,
	message: (req: Request) => {
		return { status: 423, id: req.body.postID, count: 0 };
	}
});

postsRouter.get('/:post_id/oembed.json', async function (req, res) {
	const { params, auth, hasAuth } = parseReq(req, {
		params: z.object({
			post_id: z.string()
		})
	});
	const maybeTokens = hasAuth() ? auth().tokens : {};

	const post = await getPostById(maybeTokens, params.post_id);
	if (!post) {
		return res.sendStatus(404);
	}

	const community = await database.getCommunityByID(post.community_id);
	const postPNID = await getUserAccountData(post.pid);

	let img = {};
	if (post.painting !== '') {
		img = {
			thumbnail_url: `${res.locals.cdnURL}/paintings/${post.pid}/${post.id}.png`,
			thumbnail_width: 320,
			thumbnail_height: 120
		};
	} else if (post.screenshot_thumb !== '') {
		img = {
			thumbnail_url: `${res.locals.cdnURL}${post.screenshot_thumb}`
		};
	} else {
		img = {
			thumbnail_url: 'https://pretendo.network/assets/images/opengraph/opengraph-image.png',
			thumbnail_width: 727,
			thumbnail_height: 298
		};
	}

	const doc = {
		type: 'link',
		version: '1.0',
		title: `${post.screen_name} (@${postPNID.username}) - ${community?.name}`,
		description: post.body,
		author_name: post.screen_name,
		author_url: 'https://juxt.pretendo.network/users/show?pid=' + post.pid,
		provider_name: 'Juxtaposition - Pretendo Network',
		provider_url: `https://juxt.pretendo.network`,
		...img
	};
	res.send(doc);
});

postsRouter.post('/empathy', yeahLimit, async function (req, res) {
	const { body, auth } = parseReq(req, {
		body: z.object({
			postID: z.string()
		})
	});

	const post = await getPostById(auth().tokens, body.postID);
	if (!post) {
		return res.sendStatus(404);
	}

	const existingEmpathy = post.yeahs.indexOf(auth().pid) !== -1;
	const result = !existingEmpathy
		? await addEmpathyById(auth().tokens, post.id)
		: await removeEmpathyById(auth().tokens, post.id);
	if (result === null) {
		res.send({ status: 423, id: post.id, count: post.empathy_count });
		return;
	}

	res.send({ status: 200, id: result.post_id, count: result.empathy_count });

	await redisRemove(`${post.pid}_user_page_posts`);
});

postsRouter.post('/new', postLimit, upload.none(), async function (req, res) {
	await newPost(req, res);
});

postsRouter.get('/:post_id', async function (req, res) {
	const { params, hasAuth, auth } = parseReq(req, {
		params: z.object({
			post_id: z.string()
		})
	});
	const maybeTokens = hasAuth() ? auth().tokens : {};

	let userSettings: HydratedSettingsDocument | null = null;
	let userContent: InferSchemaType<typeof ContentSchema> | null = null;
	if (hasAuth()) {
		userSettings = await database.getUserSettings(auth().pid);
		userContent = await database.getUserContent(auth().pid);
	}

	const post = await getPostById(maybeTokens, params.post_id);
	if (!post) {
		return res.redirect('/404');
	}
	if (post.parent) {
		const parent = await getPostById(maybeTokens, post.parent);
		if (!parent) {
			return res.redirect('/404');
		}
		return res.redirect(`/posts/${parent.id}`);
	}
	const community = await database.getCommunityByID(post.community_id);
	if (!community) {
		return res.redirect('/404');
	}

	// increase limit for post replies since there's no pagination yet
	const replies = (await getPostsByParentId(maybeTokens, post.id, 0, 500))?.items ?? [];
	const postPNID = await getUserAccountData(post.pid);
	const canPost = hasAuth() && (
		(community.permissions.open && community.type < 2) ||
		(community.admins && community.admins.indexOf(auth().pid) !== -1) ||
		(auth().user.accessLevel >= community.permissions.minimum_new_comment_access_level)
	) && userSettings?.account_status === 0;

	const props: PostPageViewProps = {
		ctx: buildContext(res),
		community,
		post,
		postPNID,
		replies,
		canPost,
		userContent
	};
	res.jsxForDirectory({
		web: <WebPostPageView {...props} />,
		ctr: <CtrPostPageView {...props} />,
		portal: <PortalPostPageView {...props} />
	});
});

postsRouter.delete('/:post_id', async function (req, res) {
	const { params, query, auth } = parseReq(req, {
		params: z.object({
			post_id: z.string()
		}),
		query: z.object({
			reason: z.string().optional()
		})
	});

	const post = await getPostById(auth().tokens, params.post_id);
	if (!post) {
		return res.sendStatus(404);
	}

	const result = await deletePostById(auth().tokens, post.id, query.reason);
	if (result === null) {
		return res.sendStatus(404);
	}

	// TODO move audit logging to backend
	if (res.locals.moderator && auth().pid !== post.pid) {
		const reason = query.reason ? query.reason : 'Removed by moderator';

		// TODO Temporarily disabled, moderators need a way to delete without notification
		// const postType = post.parent ? 'comment' : 'post';
		// await newNotification({
		// 	pid: post.pid,
		// 	type: 'notice',
		// 	text: `Your ${postType} "${post.id}" has been removed for the following reason: "${reason}"`,
		// 	image: '/images/bandwidthalert.png',
		// 	link: '/titles/2551084080/new'
		// });

		await createLogEntry(
			auth().pid,
			'REMOVE_POST',
			post.pid.toString(),
			`Post ${post.id} removed for: "${reason}"`
		);
	}

	res.statusCode = 200;
	if (post.parent) {
		res.send(`/posts/${post.parent}`);
	} else {
		res.send('/users/me');
	}
	await redisRemove(`${post.pid}_user_page_posts`);
});

postsRouter.post('/:post_id/new', postLimit, upload.none(), async function (req, res) {
	await newPost(req, res);
});

postsRouter.post('/:post_id/report', upload.none(), async function (req, res) {
	const { body, auth } = parseReq(req, {
		body: z.object({
			reason: z.string(),
			message: z.string(),
			post_id: z.string()
		})
	});

	const { reason, message, post_id } = body;
	const post = await getPostById(auth().tokens, post_id);
	if (!reason || !post_id || !post) {
		return res.redirect('/404');
	}

	const duplicate = await database.getDuplicateReports(auth().pid, post_id);
	if (duplicate) {
		return res.redirect(`/posts/${post.id}`);
	}

	const reportDoc = {
		pid: post.pid,
		reported_by: auth().pid,
		post_id,
		reason,
		message,
		created_at: new Date()
	};

	const reportObj = new REPORT(reportDoc);
	await reportObj.save();

	return res.redirect(`/posts/${post.id}`);
});

function canPost(community: InferSchemaType<typeof CommunitySchema>, userSettings: HydratedSettingsDocument, parentPost: InferSchemaType<typeof PostSchema> | null, user: GetUserDataResponse): boolean {
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

async function newPost(req: Request, res: Response): Promise<void> {
	const { params, body, auth } = parseReq(req, {
		params: z.object({
			post_id: z.string().optional()
		}),
		body: z.object({
			body: z.string().default(''),
			painting: z.string().default(''),
			screenshot: z.string().default(''),
			community_id: z.string(),
			_post_type: z.string(),
			bmp: z.stringbool().default(false),
			feeling_id: z.coerce.number(),
			spoiler: z.stringbool().default(false),
			is_app_jumpable: z.stringbool().default(false),
			language_id: z.coerce.number().optional()
		})
	});

	const userSettings = await database.getUserSettings(auth().pid);
	let parentPost = null;
	const postId = await generatePostUID(21);
	let community = await database.getCommunityByID(body.community_id);
	if (params.post_id) {
		parentPost = await database.getPostByID(params.post_id.toString());
		if (!parentPost) {
			res.sendStatus(403);
			return;
		} else {
			community = await database.getCommunityByID(parentPost.community_id);
		}
	}
	if (params.post_id && (body.body === '' && body.painting === '' && body.screenshot === '')) {
		res.status(422);
		return res.redirect('/posts/' + req.params.post_id.toString());
	}
	if (!community || !userSettings || !req.user) {
		res.status(403);
		logger.error('Incoming post is missing data - rejecting');
		return res.redirect('/titles/show');
	}

	if (!canPost(community, userSettings, parentPost, req.user)) {
		res.status(403);
		return res.redirect(`/titles/${community.olive_community_id}/new`);
	}

	let paintings: PaintingUrls | null = null;
	if (body._post_type === 'painting' && body.painting) {
		paintings = await uploadPainting({
			blob: body.painting,
			autodetectFormat: false,
			isBmp: body.bmp,
			pid: auth().pid,
			postId
		});
		if (paintings === null) {
			res.status(422);
			res.renderError({
				code: 422,
				message: 'Upload failed. Please try again later.'
			});
			return;
		}
	}
	let screenshots = null;
	if (body.screenshot) {
		screenshots = await uploadScreenshot({
			blob: body.screenshot,
			pid: auth().pid,
			postId
		});
		if (screenshots === null) {
			res.status(422);
			res.renderError({
				code: 422,
				message: 'Upload failed. Please try again later.'
			});
			return;
		}
	}

	let miiFace;
	switch (body.feeling_id) {
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
		default:
			miiFace = 'normal_face.png';
			break;
	}
	const postBody = req.body.body;
	if (postBody && getInvalidPostRegex().test(postBody)) {
		// TODO - Log this error
		res.sendStatus(422);
		return;
	}

	if (postBody && postBody.length > 280) {
		// TODO - Log this error
		res.sendStatus(422);
		return;
	}
	const document = {
		title_id: community.title_id[0],
		community_id: community.olive_community_id,
		screen_name: userSettings.screen_name,
		body: postBody,
		painting: paintings?.blob ?? '',
		painting_img: paintings?.img ?? '',
		painting_big: paintings?.big ?? '',
		screenshot: screenshots?.full ?? '',
		screenshot_big: screenshots?.big ?? '',
		screenshot_length: screenshots?.fullLength ?? 0,
		screenshot_thumb: screenshots?.thumb ?? '',
		screenshot_aspect: screenshots?.aspect ?? '',
		country_id: auth().paramPackData?.country_id ?? 49,
		created_at: new Date(),
		feeling_id: body.feeling_id,
		id: postId,
		is_autopost: 0,
		is_spoiler: (body.spoiler) ? 1 : 0,
		is_app_jumpable: body.is_app_jumpable,
		language_id: body.language_id,
		mii: auth().user.mii?.data,
		mii_face_url: `${config.cdnDomain}/mii/${auth().pid}/${miiFace}`,
		pid: auth().pid,
		platform_id: auth().paramPackData?.platform_id ?? 0,
		region_id: auth().paramPackData?.region_id ?? 2,
		verified: res.locals.moderator,
		parent: parentPost ? parentPost.id : null
	};
	const duplicatePost = await database.getDuplicatePosts(auth().pid, document);
	if (duplicatePost && params.post_id) {
		return res.redirect('/posts/' + params.post_id.toString());
	}
	if ((document.body === '' && document.painting === '' && document.screenshot === '') || duplicatePost) {
		return res.redirect('/titles/' + community.olive_community_id + '/new');
	}
	const newPost = new POST(document);
	newPost.save();
	if (parentPost) {
		parentPost.reply_count = parentPost.reply_count + 1;
		parentPost.save();
	}
	if (parentPost) {
		if (!params.post_id) {
			throw new Error('Has parent post but no postId, this is impossible');
		}
		res.redirect('/posts/' + params.post_id.toString());
		await redisRemove(`${parentPost.pid}_user_page_posts`);
	} else {
		res.redirect('/titles/' + community.olive_community_id + '/new');
		await redisRemove(`${auth().pid}_user_page_posts`);
	}
}

async function generatePostUID(length: number): Promise<string> {
	let id = Buffer.from(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length * 2))), 'binary').toString('base64').replace(/[+/]/g, '').substring(0, length);
	const inuse = await POST.findOne({ id });
	id = (inuse ? await generatePostUID(length) : id);
	return id;
}
