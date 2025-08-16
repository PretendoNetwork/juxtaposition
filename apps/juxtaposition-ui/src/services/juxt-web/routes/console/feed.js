import express from 'express';
import moment from 'moment';
import { database } from '@/database';
import { getCommunityHash } from '@/util';
import { POST } from '@/models/post';
import { config } from '@/config';
export const feedRouter = express.Router();

feedRouter.get('/', async function (req, res) {
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await getCommunityHash();
	if (!userContent) {
		return res.redirect('/404');
	}
	const posts = await database.getNewsFeed(userContent, config.postLimit);

	const bundle = {
		posts,
		open: true,
		communityMap,
		userContent,
		link: `/feed/more?offset=${posts.length}&pjax=true`
	};

	if (req.query.pjax) {
		return res.render(req.directory + '/partials/posts_list.ejs', {
			bundle,
			moment
		});
	}

	res.render(req.directory + '/feed.ejs', {
		moment: moment,
		title: res.locals.lang.global.activity_feed,
		userContent: userContent,
		posts: posts,
		communityMap: communityMap,
		bundle,
		tab: 0,
		template: 'posts_list'
	});
});

feedRouter.get('/all', async function (req, res) {
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await getCommunityHash();
	if (!userContent) {
		return res.redirect('/404');
	}
	const posts = await POST.find({
		parent: null,
		message_to_pid: null,
		removed: false
	}).limit(config.postLimit).sort({ created_at: -1 });

	const bundle = {
		posts,
		open: true,
		communityMap,
		userContent,
		link: `/feed/all/more?offset=${posts.length}&pjax=true`
	};

	if (req.query.pjax) {
		return res.render(req.directory + '/partials/posts_list.ejs', {
			bundle,
			moment
		});
	}

	res.render(req.directory + '/feed.ejs', {
		moment: moment,
		title: res.locals.lang.global.activity_feed,
		userContent: userContent,
		posts: posts,
		communityMap: communityMap,
		bundle,
		tab: 1,
		template: 'posts_list'
	});
});

feedRouter.get('/more', async function (req, res) {
	let offset = parseInt(req.query.offset);
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await getCommunityHash();
	if (!offset) {
		offset = 0;
	}
	const posts = await database.getNewsFeedOffset(userContent, config.postLimit, offset);

	const bundle = {
		posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		link: `/feed/more?offset=${offset + posts.length}&pjax=true`
	};

	if (posts.length > 0) {
		res.render(req.directory + '/partials/posts_list.ejs', {
			communityMap: communityMap,
			moment: moment,
			database: database,
			bundle
		});
	} else {
		res.sendStatus(204);
	}
});

feedRouter.get('/all/more', async function (req, res) {
	let offset = parseInt(req.query.offset);
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await getCommunityHash();
	if (!offset) {
		offset = 0;
	}

	const posts = await POST.find({
		parent: null,
		message_to_pid: null,
		removed: false
	}).skip(offset).limit(config.postLimit).sort({ created_at: -1 });

	const bundle = {
		posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		link: `/feed/all/more?offset=${offset + posts.length}&pjax=true`
	};

	if (posts.length > 0) {
		res.render(req.directory + '/partials/posts_list.ejs', {
			communityMap: communityMap,
			moment: moment,
			database: database,
			bundle
		});
	} else {
		res.sendStatus(204);
	}
});
