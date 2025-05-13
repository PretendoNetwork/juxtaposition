const express = require('express');
const moment = require('moment');
const database = require('../../../../database');
const util = require('../../../../util');
const { POST } = require('../../../../models/post');
const { config } = require('../../../../config');
const router = express.Router();

router.get('/', async function (req, res) {
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
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
		template: 'posts_list',
		moderator: req.moderator
	});
});

router.get('/all', async function (req, res) {
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
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

router.get('/more', async function (req, res) {
	let offset = parseInt(req.query.offset);
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
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

router.get('/all/more', async function (req, res) {
	let offset = parseInt(req.query.offset);
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
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
		lang: req.lang,
		mii_image_CDN: config.miiImageCdn,
		link: `/feed/more?offset=${offset + posts.length}&pjax=true`,
		moderator: req.moderator
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

router.get('/all/more', async function (req, res) {
	let offset = parseInt(req.query.offset);
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
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
		lang: req.lang,
		mii_image_CDN: config.miiImageCdn,
		link: `/feed/all/more?offset=${offset + posts.length}&pjax=true`,
		moderator: req.moderator
	};

	if (posts.length > 0) {
		res.render(req.directory + '/partials/posts_list.ejs', {
			communityMap: communityMap,
			moment: moment,
			database: database,
			bundle,
			cdnURL: config.cdnDomain,
			lang: req.lang,
			mii_image_CDN: config.miiImageCdn,
			pid: req.pid,
			moderator: req.moderator
		});
	} else {
		res.sendStatus(204);
	}
});

module.exports = router;
