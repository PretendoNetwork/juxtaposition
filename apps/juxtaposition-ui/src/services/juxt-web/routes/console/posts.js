import crypto from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import moment from 'moment';
import multer from 'multer';
import { getPostById } from '@/api/post';
import { config } from '@/config';
import { database } from '@/database';
import { logger } from '@/logger';
import { POST } from '@/models/post';
import { REPORT } from '@/models/report';
import { redisRemove } from '@/redisCache';
import { createLogEntry, getCommunityHash, getUserAccountData, INVALID_POST_BODY_REGEX, newNotification } from '@/util';
import { uploadPainting, uploadScreenshot } from '@/images';
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
			res.render(req.directory + '/error.ejs', {
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
	legacyHeaders: true
});

postsRouter.get('/:post_id/oembed.json', async function (req, res) {
	const post = await getPostById(req.tokens, req.params.post_id);
	if (!post) {
		return res.sendStatus(404);
	}
	const doc = {
		author_name: post.screen_name,
		author_url: 'https://juxt.pretendo.network/users/show?pid=' + post.pid
	};
	res.send(doc);
});

postsRouter.post('/empathy', yeahLimit, async function (req, res) {
	const post = await database.getPostByID(req.body.postID);
	if (!post) {
		return res.sendStatus(404);
	}
	if (post.yeahs.indexOf(req.pid) === -1) {
		await POST.updateOne({
			id: post.id,
			yeahs: {
				$ne: req.pid
			}
		},
		{
			$inc: {
				empathy_count: 1
			},
			$push: {
				yeahs: req.pid
			}
		});
		res.send({ status: 200, id: post.id, count: post.empathy_count + 1 });
		if (req.pid !== post.pid) {
			await newNotification({
				pid: post.pid,
				type: 'yeah',
				objectID: post.id,
				userPID: req.pid,
				link: `/posts/${post.id}`
			});
		}
	} else if (post.yeahs.indexOf(req.pid) !== -1) {
		await POST.updateOne({
			id: post.id,
			yeahs: {
				$eq: req.pid
			}
		},
		{
			$inc: {
				empathy_count: -1
			},
			$pull: {
				yeahs: req.pid
			}
		});
		res.send({ status: 200, id: post.id, count: post.empathy_count - 1 });
	} else {
		res.send({ status: 423, id: post.id, count: post.empathy_count });
	}
	await redisRemove(`${post.pid}_user_page_posts`);
});

postsRouter.post('/new', postLimit, upload.none(), async function (req, res) {
	await newPost(req, res);
});

postsRouter.get('/:post_id', async function (req, res) {
	const userSettings = await database.getUserSettings(req.pid);
	const userContent = await database.getUserContent(req.pid);

	const post = await getPostById(req.tokens, req.params.post_id);
	if (!post) {
		return res.redirect('/404');
	}
	if (post.parent) {
		const parent = await getPostById(req.tokens, post.parent);
		if (!parent) {
			return res.redirect('/404');
		}
		return res.redirect(`/posts/${parent.id}`);
	}
	const community = await database.getCommunityByID(post.community_id);
	const communityMap = await getCommunityHash();
	const replies = await database.getPostReplies(req.params.post_id.toString(), 25);
	const postPNID = await getUserAccountData(post.pid);
	res.render(req.directory + '/post.ejs', {
		moment: moment,
		userSettings: userSettings,
		userContent: userContent,
		post: post,
		replies: replies,
		community: community,
		communityMap: communityMap,
		postPNID,
		pnid: req.user
	});
});

postsRouter.delete('/:post_id', async function (req, res) {
	const post = await database.getPostByID(req.params.post_id);
	if (!post) {
		return res.sendStatus(404);
	}
	if (req.pid !== post.pid && !res.locals.moderator) {
		return res.sendStatus(401);
	}
	if (res.locals.moderator && req.pid !== post.pid) {
		const reason = req.query.reason ? req.query.reason : 'Removed by moderator';
		await post.removePost(reason, req.pid);
		await createLogEntry(
			req.pid,
			'REMOVE_POST',
			post.pid,
			`Post ${post.id} removed for: "${reason}"`
		);
	} else {
		await post.removePost('User requested removal', req.pid);
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
	const { reason, message, post_id } = req.body;
	const post = await getPostById(req.tokens, post_id);
	if (!reason || !post_id || !post) {
		return res.redirect('/404');
	}

	const duplicate = await database.getDuplicateReports(req.pid, post_id);
	if (duplicate) {
		return res.redirect(`/posts/${post.id}`);
	}

	const reportDoc = {
		pid: post.pid,
		reported_by: req.pid,
		post_id,
		reason,
		message,
		created_at: new Date()
	};

	const reportObj = new REPORT(reportDoc);
	await reportObj.save();

	return res.redirect(`/posts/${post.id}`);
});

function canPost(community, userSettings, parentPost, user) {
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

async function newPost(req, res) {
	const userSettings = await database.getUserSettings(req.pid);
	let parentPost = null;
	const postID = await generatePostUID(21);
	const community = await database.getCommunityByID(req.body.community_id);
	if (!community || !userSettings || !req.user) {
		res.status(403);
		logger.error('Incoming post is missing data - rejecting');
		return res.redirect('/titles/show');
	}
	if (req.params.post_id && (req.body.body === '' && req.body.painting === '' && req.body.screenshot === '')) {
		res.status(422);
		return res.redirect('/posts/' + req.params.post_id.toString());
	}
	if (req.params.post_id) {
		parentPost = await database.getPostByID(req.params.post_id.toString());
		if (!parentPost) {
			return res.sendStatus(403);
		}
	}

	if (!canPost(community, userSettings, parentPost, req.user)) {
		res.status(403);
		return res.redirect(`/titles/${community.olive_community_id}/new`);
	}

	let paintingBlob = '';
	if (req.body._post_type === 'painting' && req.body.painting) {
		paintingBlob = await uploadPainting(req.body.painting, req.body.bmp, req.pid, postID);
		if (paintingBlob === null) {
			res.status(422);
			return res.render(req.directory + '/error.ejs', {
				code: 422,
				message: 'Upload failed. Please try again later.'
			});
		}
	}
	let screenshots = null;
	if (req.body.screenshot) {
		screenshots = await uploadScreenshot(req.body.screenshot, req.pid, postID);
		if (screenshots === null) {
			res.status(422);
			return res.render(req.directory + '/error.ejs', {
				code: 422,
				message: 'Upload failed. Please try again later.'
			});
		}
	}

	let miiFace;
	switch (parseInt(req.body.feeling_id)) {
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
	const body = req.body.body;
	if (body && INVALID_POST_BODY_REGEX.test(body)) {
		// TODO - Log this error
		return res.sendStatus(422);
	}

	if (body && body.length > 280) {
		// TODO - Log this error
		return res.sendStatus(422);
	}
	const document = {
		title_id: community.title_id[0],
		community_id: community.olive_community_id,
		screen_name: userSettings.screen_name,
		body: body,
		painting: paintingBlob,
		screenshot: screenshots?.full ?? '',
		screenshot_thumb: screenshots?.thumb ?? '',
		screenshot_aspect: screenshots?.aspect ?? '',
		country_id: req.paramPackData ? req.paramPackData.country_id : 49,
		created_at: new Date(),
		feeling_id: req.body.feeling_id,
		id: postID,
		is_autopost: 0,
		is_spoiler: (req.body.spoiler) ? 1 : 0,
		is_app_jumpable: req.body.is_app_jumpable,
		language_id: req.body.language_id,
		mii: req.user.mii.data,
		mii_face_url: `${config.cdnDomain}/mii/${req.user.pid}/${miiFace}`,
		pid: req.pid,
		platform_id: req.paramPackData ? req.paramPackData.platform_id : 0,
		region_id: req.paramPackData ? req.paramPackData.region_id : 2,
		verified: res.locals.moderator,
		parent: parentPost ? parentPost.id : null
	};
	const duplicatePost = await database.getDuplicatePosts(req.pid, document);
	if (duplicatePost && req.params.post_id) {
		return res.redirect('/posts/' + req.params.post_id.toString());
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
	if (parentPost && (parentPost.pid !== req.user.pid)) {
		await newNotification({
			pid: parentPost.pid,
			type: 'reply',
			user: req.pid,
			link: `/posts/${parentPost.id}`
		});
	}
	if (parentPost) {
		res.redirect('/posts/' + req.params.post_id.toString());
		await redisRemove(`${parentPost.pid}_user_page_posts`);
	} else {
		res.redirect('/titles/' + community.olive_community_id + '/new');
		await redisRemove(`${req.pid}_user_page_posts`);
	}
}

async function generatePostUID(length) {
	let id = Buffer.from(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length * 2))), 'binary').toString('base64').replace(/[+/]/g, '').substring(0, length);
	const inuse = await POST.findOne({ id });
	id = (inuse ? await generatePostUID() : id);
	return id;
}
