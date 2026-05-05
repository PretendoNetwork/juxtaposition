import express from 'express';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';
import { redisRemove } from '@/redisCache';
import { getUserAccountData } from '@/util';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebPostPageView } from '@/services/juxt-web/views/web/postPageView';
import { CtrPostPageView } from '@/services/juxt-web/views/ctr/postPageView';
import { PortalPostPageView } from '@/services/juxt-web/views/portal/postPageView';
import { CtrNewPostPage } from '@/services/juxt-web/views/ctr/newPostView';
import { PortalNewPostPage } from '@/services/juxt-web/views/portal/newPostView';
import { PortalReportPostPage } from '@/services/juxt-web/views/portal/reportPostView';
import { CtrReportPostPage } from '@/services/juxt-web/views/ctr/reportPostView';
import { getShotMode, isPostingAllowed } from '@/services/juxt-web/routes/permissions';
import { InternalApiError, wrapApi } from '@/api/errors';
import type { Request, Response } from 'express';
import type { PostPageViewProps } from '@/services/juxt-web/views/web/postPageView';
import type { EmpathyActionEnum, Post, PostCreateBody } from '@/api/generated';
import type { NewPostViewProps } from '@/services/juxt-web/views/web/newPostView';
const storage = multer.memoryStorage();
const upload = multer({ storage });
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
		name: parent.screen_name,
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
	const { body } = parseReq(req, {
		body: z.object({
			reason: z.coerce.number(),
			message: z.string().trim(),
			post_id: z.string()
		})
	});

	const { data: post } = await req.api.posts.get({ post_id: body.post_id });
	if (!post) {
		return res.redirect('/404');
	}

	await req.api.posts.report({
		post_id: post.id,
		message: body.message,
		reasonId: body.reason
	});

	return res.redirect(`/posts/${post.id}`);
});

async function newPost(req: Request, res: Response): Promise<void> {
	const { params, body, files, auth } = parseReq(req, {
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
		}),
		files: ['shot']
	});

	const rejectReturnUrl = params.post_id ? `/posts/${params.post_id}/create` : `/titles/${body.community_id}/create`;
	const postBody: PostCreateBody = {
		feelingId: body.feeling_id,
		body: body.body.length > 0 ? body.body : undefined,
		isSpoiler: body.spoiler,
		isAppJumpable: body.is_app_jumpable,
		languageId: body.language_id
	};
	const paramPack = auth().paramPackData;
	if (paramPack) {
		postBody.platformId = Number(paramPack.platform_id);
		postBody.regionId = Number(paramPack.region_id);
		postBody.countryId = Number(paramPack.country_id);
	}
	if (body._post_type === 'painting' && body.painting) {
		postBody.painting = {
			file: body.painting.replace(/\0/g, '').trim(), // Remove nintendo jank
			isBmp: body.bmp
		};
	}
	if (body.screenshot || files.shot.length === 1) {
		const bufferFile = files.shot[0]?.buffer.toString('base64');
		const base64File = body.screenshot.replace(/\0/g, '').trim(); // Remove nintendo jank
		if (!paramPack) {
			throw new Error('Must have parampack when uploading screenshot');
		}
		postBody.screenshot = {
			file: bufferFile ?? base64File,
			titleId: paramPack.title_id
		};
	}

	let newPostResult: Post | InternalApiError | null;
	if (params.post_id) {
		const out = await wrapApi(req.api.posts.reply({
			...postBody,
			post_id: params.post_id
		}));
		newPostResult = out.error ?? out.result ?? null;
	} else {
		const out = await wrapApi(req.api.communities.createPost({
			...postBody,
			id: body.community_id
		}));
		newPostResult = out.error ?? out.result ?? null;
	}

	if (newPostResult instanceof InternalApiError) {
		if (newPostResult.isCode('automod_prevented')) {
			const params = new URLSearchParams();
			params.append('error-text', res.i18n.t('new_post.automod_error'));
			return res.redirect(rejectReturnUrl + '?' + params.toString());
		}
		throw newPostResult;
	}
	if (!newPostResult) {
		throw new Error('Null newPostResult');
	}

	if (newPostResult.parent) {
		res.redirect('/posts/' + newPostResult.parent.toString());
		return;
	}

	res.redirect('/titles/' + newPostResult.community_id + '/new');
}
