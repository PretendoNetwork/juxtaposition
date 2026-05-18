import crypto from 'crypto';
import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { config } from '@/config';
import { database } from '@/database';
import { uploadPainting, uploadScreenshot } from '@/images';
import { POST } from '@/models/post';
import { REPORT } from '@/models/report';
import { redisRemove } from '@/redisCache';
import { createRatelimit, evaluateAutomodRules, getInvalidPostRegex, getUserAccountData, performAutomodAction } from '@/util';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebPostPageView } from '@/services/juxt-web/views/web/postPageView';
import { CtrPostPageView } from '@/services/juxt-web/views/ctr/postPageView';
import { PortalPostPageView } from '@/services/juxt-web/views/portal/postPageView';
import { CtrNewPostPage } from '@/services/juxt-web/views/ctr/newPostView';
import { PortalNewPostPage } from '@/services/juxt-web/views/portal/newPostView';
import { PortalReportPostPage } from '@/services/juxt-web/views/portal/reportPostView';
import { CtrReportPostPage } from '@/services/juxt-web/views/ctr/reportPostView';
import { getShotMode, isPostingAllowed } from '@/services/juxt-web/routes/permissions';
import { AutomodRule } from '@/models/automodRules';
import type { Request, Response } from 'express';
import type { PaintingUrls } from '@/images';
import type { PostPageViewProps } from '@/services/juxt-web/views/web/postPageView';
import type { EmpathyActionEnum } from '@/api/generated';
import type { NewPostViewProps } from '@/services/juxt-web/views/web/newPostView';
const storage = multer.memoryStorage();
const upload = multer({ storage });
export const postsRouter = express.Router();

const postLimit = createRatelimit('posts', {
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

const yeahLimit = createRatelimit('yeahs', {
	windowMs: 60 * 1000, // 1 minute
	max: 60, // Limit each IP to 60 requests per `window`
	standardHeaders: true,
	legacyHeaders: true,
	message: (req: Request) => {
		return { status: 423, id: req.body.postID, count: 0 };
	}
});

postsRouter.get('/:post_id/oembed.json', async function (req, res) {
	const { params } = parseReq(req, {
		params: z.object({
			post_id: z.string()
		})
	});

	const { data: post } = await req.api.posts.get({ post_id: params.post_id });
	if (!post) {
		return res.sendStatus(404);
	}

	const { data: community } = await req.api.communities.get({ id: post.community_id });
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

	const { data: post } = await req.api.posts.get({ post_id: body.postID });
	if (!post) {
		return res.sendStatus(404);
	}

	const existingEmpathy = post.yeahs.indexOf(auth().pid) !== -1;
	const action: EmpathyActionEnum = !existingEmpathy ? 'add' : 'remove';
	const { data: result } = await req.api.posts.changeEmpathy({ post_id: post.id, action });
	if (result === null) {
		res.send({ status: 423, id: post.id, count: post.empathy_count });
		return;
	}

	res.send({ status: 200, id: result.post_id, count: result.empathy_count });

	await redisRemove(`${post.pid}_user_page_posts`);
});

postsRouter.post('/new', postLimit, upload.fields([{ name: 'shot', maxCount: 1 }]), async function (req, res) {
	await newPost(req, res);
});

postsRouter.get('/:post_id', async function (req, res) {
	const { params, hasAuth, auth } = parseReq(req, {
		params: z.object({
			post_id: z.string()
		})
	});
	const self = hasAuth() ? auth().self : null;

	const { data: post } = await req.api.posts.get({ post_id: params.post_id });
	if (!post) {
		return res.redirect('/404');
	}
	if (post.parent) {
		const { data: parent } = await req.api.posts.get({ post_id: post.parent });
		if (!parent) {
			return res.redirect('/404');
		}
		return res.redirect(`/posts/${parent.id}`);
	}
	const { data: community } = await req.api.communities.get({ id: post.community_id });
	if (!community) {
		return res.redirect('/404');
	}

	// increase limit for post replies since there's no pagination yet
	const replies = (await req.api.posts.list({ parent_id: post.id, include_replies: 'true', sort: 'oldest', limit: 500 }))?.data.items ?? [];
	const postPNID = await getUserAccountData(post.pid);
	const canPost = !!self && isPostingAllowed(community, self, post);

	const props: PostPageViewProps = {
		community,
		post,
		postPNID,
		replies,
		canPost,
		userContent: self?.content ?? null
	};
	res.jsxForDirectory({
		web: <WebPostPageView {...props} />,
		ctr: <CtrPostPageView {...props} />,
		portal: <PortalPostPageView {...props} />
	});
});

postsRouter.delete('/:post_id', async function (req, res) {
	const { params, query } = parseReq(req, {
		params: z.object({
			post_id: z.string()
		}),
		query: z.object({
			reason: z.string().optional()
		})
	});

	const { data: post } = await req.api.posts.get({ post_id: params.post_id });
	if (!post) {
		return res.sendStatus(404);
	}

	const { data: result } = await req.api.posts.delete({ post_id: post.id, reason: query.reason });
	if (result === null) {
		return res.sendStatus(404);
	}

	res.statusCode = 200;
	if (post.parent) {
		res.send(`/posts/${post.parent}`);
	} else {
		res.send('/users/me');
	}
	await redisRemove(`${post.pid}_user_page_posts`);
});

postsRouter.post('/:post_id/new', postLimit, upload.fields([{ name: 'shot', maxCount: 1 }]), async function (req, res) {
	await newPost(req, res);
});

postsRouter.get('/:post_id/create', async function (req, res) {
	const { params, auth, query } = parseReq(req, {
		params: z.object({
			post_id: z.string()
		}),
		query: z.object({
			'error-text': z.string().optional()
		})
	});

	const { data: parent } = await req.api.posts.get({ post_id: params.post_id });
	if (!parent) {
		return res.sendStatus(404);
	}

	const { data: community } = await req.api.communities.get({ id: parent.community_id });
	if (!community) {
		return res.sendStatus(404);
	}

	const shotMode = getShotMode(community, auth().paramPackData);

	const props: NewPostViewProps = {
		id: parent.community_id,
		pid: parent.pid,
		url: `/posts/${parent.id}/new`,
		show: 'post',
		shotMode,
		community,
		errorText: query['error-text']
	};
	res.jsxForDirectory({
		ctr: <CtrNewPostPage {...props} />,
		portal: <PortalNewPostPage {...props} />
	});
});

postsRouter.get('/:post_id/report', async function (req, res) {
	const { params } = parseReq(req, {
		params: z.object({
			post_id: z.string()
		})
	});

	const { data: post } = await req.api.posts.get({ post_id: params.post_id });
	if (!post) {
		return res.redirect('/404');
	}

	const props = {
		id: params.post_id
	};
	return res.jsxForDirectory({
		ctr: <CtrReportPostPage {...props} />,
		portal: <PortalReportPostPage {...props} />
	});
});

postsRouter.post('/:post_id/report', upload.none(), async function (req, res) {
	const { body, query, auth } = parseReq(req, {
		body: z.object({
			reason: z.string(),
			message: z.string(),
			post_id: z.string()
		}),
		query: z.object({
			pjax_api: z.stringbool().default(false)
		})
	});

	const reject = (reason: string): void => {
		if (query.pjax_api) {
			const doc = { status: 400, message: reason, href: '#back' };
			res.send(`<script>parent.postMessage('${JSON.stringify(doc)}','*');</script>`);
			return;
		}

		res.renderError({
			code: 400,
			message: reason
		});
	};

	const { reason, message, post_id } = body;
	const { data: post } = await req.api.posts.get({ post_id });
	if (!post_id || !post) {
		return reject(res.i18n.t('reporting.invalid_post'));
	}

	const accept = (message: string): void => {
		const acceptNextUrl = `/titles/${post.community_id}/new`;
		if (query.pjax_api) {
			const doc = { status: 200, message, href: acceptNextUrl };
			res.send(`<script>parent.postMessage('${JSON.stringify(doc)}','*');</script>`);
			return;
		}
		return res.redirect(acceptNextUrl);
	};

	const duplicate = await database.getDuplicateReports(auth().pid, post_id);
	if (duplicate) {
		return reject(res.i18n.t('reporting.invalid_dupe'));
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

	return accept(res.i18n.t('reporting.submitted'));
});

async function newPost(req: Request, res: Response): Promise<void> {
	const { params, query, body, files, auth, hasAuth } = parseReq(req, {
		params: z.object({
			post_id: z.string().optional()
		}),
		query: z.object({
			pjax_api: z.stringbool().default(false)
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
		}),
		files: ['shot']
	});
	const self = hasAuth() ? auth().self : null;

	const reject = (reason: string): void => {
		const rejectReturnUrl = params.post_id ? `/posts/${params.post_id}/create` : `/titles/${body.community_id}/create`;
		const errorParams = new URLSearchParams();
		errorParams.append('error-text', reason);
		const url = rejectReturnUrl + '?' + errorParams.toString();

		if (query.pjax_api) {
			const doc = { status: 400, href: url };
			res.send(`<script>parent.postMessage('${JSON.stringify(doc)}','*');</script>`);
			return;
		}
		return res.redirect(url);
	};
	const accept = (): void => {
		const acceptNextUrl = params.post_id ? `/posts/${params.post_id}` : `/titles/${body.community_id}/new`;
		if (query.pjax_api) {
			const doc = { status: 200, href: acceptNextUrl };
			res.send(`<script>parent.postMessage('${JSON.stringify(doc)}','*');</script>`);
			return;
		}
		return res.redirect(acceptNextUrl);
	};

	let parentPost = null;
	const postId = await generatePostUID(21);
	let { data: community } = await req.api.communities.get({ id: body.community_id });
	if (params.post_id) {
		parentPost = await database.getPostByID(params.post_id.toString());
		if (!parentPost || parentPost.removed) {
			return reject(res.i18n.t('new_post.invalid_data'));
		}
		const { data: parentPostCommunity } = await req.api.communities.get({ id: parentPost.community_id ?? '' });
		community = parentPostCommunity;
	}

	if (body.body === '' && body.painting === '' && body.screenshot === '' && files.shot.length == 0) {
		return reject(res.i18n.t('new_post.empty_post'));
	}

	if (!community || !self) {
		return reject(res.i18n.t('new_post.invalid_data'));
	}

	if (!isPostingAllowed(community, self, parentPost)) {
		return reject(res.i18n.t('new_post.permission_denied'));
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
			return reject(res.i18n.t('new_post.upload_failed'));
		}
	}

	let screenshots = null;
	if ((body.screenshot || files.shot.length === 1) &&
		getShotMode(community, auth().paramPackData) !== 'block') {
		screenshots = await uploadScreenshot({
			buffer: files.shot[0]?.buffer,
			blob: body.screenshot,
			pid: auth().pid,
			postId
		});
		if (screenshots === null) {
			return reject(res.i18n.t('new_post.upload_failed'));
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
	const postBody = body.body;
	if (postBody && getInvalidPostRegex().test(postBody)) {
		return reject(res.i18n.t('new_post.invalid_content'));
	}

	/* Don't count \r\n as two */
	if (postBody && postBody.replaceAll('\r\n', '\n').length > 280) {
		return reject(res.i18n.t('new_post.post_too_long'));
	}

	const document = {
		title_id: community.titleIds[0],
		community_id: community.olive_community_id,
		screen_name: self.miiName,
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
	const maxDuplicatePostAgeMs = 5 * 60 * 1000;
	const duplicatePost = await database.getDuplicatePosts(auth().pid, document, maxDuplicatePostAgeMs);
	if (duplicatePost) {
		// Lying!
		return accept();
	}

	// Automod
	const automodRules = await AutomodRule.find({ enabled: true });
	const automodEval = evaluateAutomodRules(document, automodRules);
	const automodResult = await performAutomodAction(document, automodEval);
	if (!automodResult.allowPost) {
		return reject(res.i18n.t('new_post.automod_error'));
	}

	// Actual posting
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

		await redisRemove(`${parentPost.pid}_user_page_posts`);
		return accept();
	} else {
		await redisRemove(`${auth().pid}_user_page_posts`);
		return accept();
	}
}

async function generatePostUID(length: number): Promise<string> {
	let id = Buffer.from(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length * 2))), 'binary').toString('base64').replace(/[+/]/g, '').substring(0, length);
	const inuse = await POST.findOne({ id });
	id = (inuse ? await generatePostUID(length) : id);
	return id;
}
