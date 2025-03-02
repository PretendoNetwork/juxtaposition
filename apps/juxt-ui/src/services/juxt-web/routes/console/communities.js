const express = require('express');
const multer = require('multer');
const moment = require('moment');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const { POST } = require('../../../../models/post');
const { COMMUNITY } = require('../../../../models/communities');
const redis = require('../../../../redisCache');

router.get('/', async function (req, res) {
	const newCommunities = JSON.parse(await redis.getValue('newCommunities')) || await database.getNewCommunities(6);
	let popularCommunities = JSON.parse(await redis.getValue('popularCommunities'));

	if (!popularCommunities) {
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
		redis.setValue('popularCommunities', JSON.stringify(popularCommunities), 60 * 60);
		redis.setValue('newCommunities', JSON.stringify(newCommunities), 60 * 60);
	}

	res.render(req.directory + '/communities.ejs', {
		cache: true,
		popularCommunities: popularCommunities,
		newCommunities: newCommunities
	});
});

router.get('/all', async function (req, res) {
	const communities = await database.getCommunities(90);
	res.render(req.directory + '/all_communities.ejs', {
		communities: communities
	});
});

router.get('/:communityID', async function (req, res) {
	if (req.query.title_id) {
		const community = await database.getCommunityByTitleID(req.query.title_id);
		if (!community) {
			return res.redirect('/404');
		}
		return res.redirect(`/titles/${community.olive_community_id}/new`);
	}
	res.redirect(`/titles/${req.params.communityID}/new`);
});

router.get('/:communityID/related', async function (req, res) {
	const userSettings = await database.getUserSettings(req.pid);
	const userContent = await database.getUserContent(req.pid);
	if (!userContent || !userSettings) {
		return res.redirect('/404');
	}
	const community = await database.getCommunityByID(req.params.communityID.toString());
	if (!community) {
		return res.render(req.directory + '/error.ejs', { code: 404, message: 'Community not Found' });
	}
	const communityMap = await util.getCommunityHash();
	const children = await database.getSubCommunities(community.olive_community_id);
	if (!children) {
		return res.redirect(`/titles/${community.olive_community_id}/new`);
	}

	res.render(req.directory + '/sub_communities.ejs', {
		selection: 2,
		communityMap,
		community,
		children
	});
});

router.get('/:communityID/:type', async function (req, res) {
	const userSettings = await database.getUserSettings(req.pid);
	const userContent = await database.getUserContent(req.pid);
	if (!userContent || !userSettings) {
		return res.redirect('/404');
	}
	const community = await database.getCommunityByID(req.params.communityID.toString());
	if (!community) {
		return res.render(req.directory + '/error.ejs', { code: 404, message: 'Community not Found' });
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
	const communityMap = await util.getCommunityHash();
	let children = await database.getSubCommunities(community.olive_community_id);
	if (children.length === 0) {
		children = null;
	}
	let posts;
	let type;

	if (req.params.type === 'hot') {
		posts = await database.getNumberPopularCommunityPostsByID(community, config.post_limit);
		type = 1;
	} else if (req.params.type === 'verified') {
		posts = await database.getNumberVerifiedCommunityPostsByID(community, config.post_limit);
		type = 2;
	} else {
		posts = await database.getNewPostsByCommunity(community, config.post_limit);
		type = 0;
	}
	const numPosts = await database.getTotalPostsByCommunity(community);

	const bundle = {
		posts,
		open: community.permissions.open,
		numPosts,
		communityMap,
		userContent,
		link: `/titles/${req.params.communityID}/${req.params.type}/more?offset=${posts.length}&pjax=true`
	};

	if (req.query.pjax) {
		return res.render(req.directory + '/partials/posts_list.ejs', {
			bundle,
			moment
		});
	}

	res.render(req.directory + '/community.ejs', {
		// EJS variable and server-side variable
		moment: moment,
		community: community,
		communityMap: communityMap,
		posts: posts,
		totalNumPosts: numPosts,
		userSettings: userSettings,
		userContent: userContent,
		account_server: config.account_server_domain.slice(8),
		pnid: req.user,
		children,
		type,
		bundle,
		template: 'posts_list'
	});
});

router.get('/:communityID/:type/more', async function (req, res) {
	let offset = parseInt(req.query.offset);
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
	let posts;
	const community = await database.getCommunityByID(req.params.communityID);
	if (!community) {
		return res.redirect('/404');
	}
	if (!offset) {
		offset = 0;
	}
	switch (req.params.type) {
		case 'popular':
			posts = await database.getNumberPopularCommunityPostsByID(community, config.post_limit, offset);
			break;
		case 'verified':
			posts = await database.getNumberVerifiedCommunityPostsByID(community, config.post_limit, offset);
			break;
		default:
			posts = await database.getNewPostsByCommunity(community, config.post_limit, offset);
			break;
	}

	const bundle = {
		posts,
		open: true,
		numPosts: posts.length,
		communityMap,
		userContent,
		link: `/titles/${req.params.communityID}/${req.params.type}/more?offset=${offset + posts.length}&pjax=true`
	};

	if (posts.length > 0) {
		res.render(req.directory + '/partials/posts_list.ejs', {
			communityMap: communityMap,
			moment: moment,
			database: database,
			bundle,
			account_server: config.account_server_domain.slice(8)
		});
	} else {
		res.sendStatus(204);
	}
});

router.post('/follow', upload.none(), async function (req, res) {
	const community = await database.getCommunityByID(req.body.id);
	const userContent = await database.getUserContent(req.pid);
	const popularCommunities = JSON.parse(await redis.getValue('popularCommunities'));
	let updated = false;

	if (userContent !== null && userContent.followed_communities.indexOf(community.olive_community_id) === -1) {
		community.upFollower();
		userContent.addToCommunities(community.olive_community_id);
		res.send({ status: 200, id: community.olive_community_id, count: community.followers });
		updated = true;
	} else if (userContent !== null && userContent.followed_communities.indexOf(community.olive_community_id) !== -1) {
		community.downFollower();
		userContent.removeFromCommunities(community.olive_community_id);
		res.send({ status: 200, id: community.olive_community_id, count: community.followers });
		updated = true;
	} else {
		res.send({ status: 423, id: community.olive_community_id, count: community.followers });
	}

	if (popularCommunities && updated) {
		const index = popularCommunities.findIndex(element => element.olive_community_id === community.olive_community_id);
		if (index !== -1) {
			popularCommunities[index].followers = community.followers;
			redis.setValue('popularCommunities', JSON.stringify(popularCommunities), 60 * 60);
		}
	}
});

async function calculateMostPopularCommunities() {
	const now = new Date();
	const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	const posts = await POST.find({ created_at: { $gte: last24Hours }, message_to_pid: null }).lean();

	const communityIds = {};
	for (const post of posts) {
		const communityId = post.community_id;
		communityIds[communityId] = (communityIds[communityId] || 0) + 1;
	}
	return Object.entries(communityIds)
		.sort((a, b) => b[1] - a[1])
		.map(entry => entry[0]);
}

module.exports = router;
