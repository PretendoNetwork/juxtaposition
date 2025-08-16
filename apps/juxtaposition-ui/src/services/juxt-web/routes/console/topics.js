import express from 'express';
import moment from 'moment';
import { database } from '@/database';
import * as util from '@/util';
import { POST } from '@/models/post';

export const topicsRouter = express.Router();

topicsRouter.get('/', async function (req, res) {
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
	const tag = req.query.topic_tag;
	if (!userContent || !tag) {
		return res.redirect('/404');
	}
	const posts = await POST.find({ topic_tag: req.query.topic_tag }).sort({ created_at: -1 }).limit(parseInt(req.query.limit));

	const bundle = {
		posts,
		open: true,
		communityMap,
		userContent,
		link: `/topics/more?tag=${tag}&offset=${posts.length}&pjax=true`
	};

	if (req.query.pjax) {
		return res.render(req.directory + '/partials/posts_list.ejs', {
			bundle,
			moment
		});
	}

	res.render(req.directory + '/feed.ejs', {
		moment: moment,
		title: tag,
		userContent: userContent,
		posts: posts,
		communityMap: communityMap,
		tab: 1,
		bundle,
		template: 'posts_list'
	});
});

topicsRouter.get('/more', async function (req, res) {
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
	const tag = req.query.topic_tag;
	if (!tag) {
		return res.sendStatus(204);
	}
	const posts = await POST.find({ topic_tag: req.query.topic_tag }).sort({ created_at: -1 }).limit(parseInt(req.query.limit));

	const bundle = {
		posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		link: `/topics/more?tag=${tag}&offset=${posts.length}&pjax=true`
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
