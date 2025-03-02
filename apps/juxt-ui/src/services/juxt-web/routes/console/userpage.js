const express = require('express');
const multer = require('multer');
const moment = require('moment');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const upload = multer({ dest: 'uploads/' });
const { POST } = require('../../../../models/post');
const { SETTINGS } = require('../../../../models/settings');
const redis = require('../../../../redisCache');
const router = express.Router();

router.get('/menu', async function (req, res) {
	const user = await database.getUserSettings(req.pid);
	res.render('ctr/user_menu.ejs', {
		user: user
	});
});

router.get('/me', async function (req, res) {
	await userPage(req, res, req.pid);
});

router.get('/notifications.json', async function (req, res) {
	const notifications = await database.getUnreadNotificationCount(req.pid);
	const messagesCount = await database.getUnreadConversationCount(req.pid);
	res.send(
		{
			message_count: messagesCount,
			notification_count: notifications
		}
	);
});

router.get('/downloadUserData.json', async function (req, res) {
	res.set('Content-Type', 'text/json');
	res.set('Content-Disposition', `attachment; filename="${req.pid}_user_data.json"`);
	const posts = await POST.find({ pid: req.pid });
	const userContent = await database.getUserSettings(req.pid);
	const userSettings = await database.getUserContent(req.pid);
	const doc = {
		user_content: userContent,
		user_settings: userSettings,
		posts: posts
	};
	res.send(doc);
});

router.get('/me/settings', async function (req, res) {
	const userSettings = await database.getUserSettings(req.pid);
	const communityMap = await util.getCommunityHash();
	res.render(req.directory + '/settings.ejs', {
		communityMap: communityMap,
		moment: moment,
		userSettings: userSettings,
		account_server: config.account_server_domain.slice(8)
	});
});

router.get('/me/:type', async function (req, res) {
	await userRelations(req, res, req.pid);
});

router.post('/me/settings', upload.none(), async function (req, res) {
	const userSettings = await database.getUserSettings(req.pid);

	userSettings.country_visibility = !!req.body.country;
	userSettings.birthday_visibility = !!req.body.birthday;
	userSettings.game_skill_visibility = !!req.body.experience;
	userSettings.profile_comment_visibility = !!req.body.comment;

	if (req.body.comment) {
		userSettings.updateComment(req.body.comment);
	} else {
		userSettings.updateComment('');
	}

	res.redirect('/users/me');
});

router.get('/show', async function (req, res) {
	res.redirect(`/users/${req.query.pid}`);
});

router.get('/:pid/more', async function (req, res) {
	await morePosts(req, res, req.params.pid);
});

router.get('/:pid/yeahs/more', async function (req, res) {
	await moreYeahPosts(req, res, req.params.pid);
});

router.get('/:pid/:type', async function (req, res) {
	await userRelations(req, res, req.params.pid);
});

// TODO: Remove the need for a parameter to toggle the following state
router.post('/follow', upload.none(), async function (req, res) {
	const userToFollowContent = await database.getUserContent(req.body.id);
	const userContent = await database.getUserContent(req.pid);
	if (userContent !== null && userContent.followed_users.indexOf(userToFollowContent.pid) === -1) {
		userToFollowContent.addToFollowers(userContent.pid);
		userContent.addToUsers(userToFollowContent.pid);
		res.send({ status: 200, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
		const picked = await database.getNotification(userToFollowContent.pid, 2, userContent.pid);
		// pid, type, reference_id, origin_pid, title, content
		if (picked === null) {
			await util.newNotification({ pid: userToFollowContent.pid, type: 'follow', objectID: req.pid, link: `/users/${req.pid}` });
		}
	} else if (userContent !== null && userContent.followed_users.indexOf(userToFollowContent.pid) !== -1) {
		userToFollowContent.removeFromFollowers(userContent.pid);
		userContent.removeFromUsers(userToFollowContent.pid);
		res.send({ status: 200, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
	} else {
		res.send({ status: 423, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
	}
});

router.get('/:pid', async function (req, res) {
	const userID = req.params.pid;
	if (userID === 'me' || Number(userID) === req.pid) {
		return res.redirect('/users/me');
	}
	await userPage(req, res, userID);
});

router.get('/:pid/:type', async function (req, res) {
	const userID = req.params.pid;
	if (userID === 'me' || Number(userID) === req.pid) {
		return res.redirect('/users/me');
	}
	await userRelations(req, res, userID);
});

async function userPage(req, res, userID) {
	if (!userID || isNaN(userID)) {
		return res.redirect('/404');
	}
	const pnid = userID === req.pid
		? req.user
		: await util.getUserDataFromPid(userID).catch((e) => {
			console.error(e.details);
		});
	const userContent = await database.getUserContent(userID);
	if (isNaN(userID) || !pnid || !userContent) {
		return res.redirect('/404');
	}

	const userSettings = await database.getUserSettings(userID);
	let posts = JSON.parse(await redis.getValue(`${userID}-user_page_posts`));
	if (!posts) {
		posts = await database.getNumberUserPostsByID(userID, config.post_limit);
		await redis.setValue(`${userID}_user_page_posts`, JSON.stringify(posts), 60 * 60 * 1);
	}

	const numPosts = await database.getTotalPostsByUserID(userID);
	const communityMap = await util.getCommunityHash();
	let friends = [];
	try {
		friends = await util.getFriends(userID);
	} catch (ignored) {
		// Do nothing
	}

	let parentUserContent;
	if (pnid.pid !== req.pid) {
		parentUserContent = await database.getUserContent(req.pid);
	}

	const bundle = {
		posts,
		open: true,
		numPosts,
		communityMap,
		userContent: parentUserContent ? parentUserContent : userContent,
		link: `/users/${userID}/more?offset=${posts.length}&pjax=true`
	};
	if (req.query.pjax) {
		return res.render(req.directory + '/partials/posts_list.ejs', {
			bundle,
			moment
		});
	}
	const link = (pnid.pid === req.pid) ? '/users/me/' : `/users/${userID}/`;
	res.render(req.directory + '/user_page.ejs', {
		template: 'posts_list',
		selection: 0,
		moment,
		pnid,
		numPosts,
		userContent,
		userSettings,
		bundle,
		account_server: config.account_server_domain.slice(8),
		link,
		friends,
		parentUserContent,
		isActive: isDateInRange(userSettings.last_active, 10)
	});
}

async function userRelations(req, res, userID) {
	const pnid = userID === req.pid ? req.user : await util.getUserDataFromPid(userID);
	const userContent = await database.getUserContent(userID);
	const link = (pnid.pid === req.pid) ? '/users/me/' : `/users/${userID}/`;
	const userSettings = await database.getUserSettings(userID);
	const numPosts = await database.getTotalPostsByUserID(userID);
	const friends = await util.getFriends(userID);
	let parentUserContent;
	if (pnid.pid !== req.pid) {
		parentUserContent = await database.getUserContent(req.pid);
	}
	if (isNaN(userID) || !pnid) {
		return res.redirect('/404');
	}

	let followers;
	let communities;
	let communityMap;
	let selection;

	if (req.params.type === 'yeahs') {
		const posts = await POST.find({ yeahs: userID, removed: false }).sort({ created_at: -1 }).limit(config.post_limit);
		const communityMap = await util.getCommunityHash();
		const bundle = {
			posts,
			open: true,
			numPosts: posts.length,
			communityMap,
			userContent: parentUserContent ? parentUserContent : userContent,
			link: `/users/${userID}/yeahs/more?offset=${posts.length}&pjax=true`
		};

		if (req.query.pjax) {
			return res.render(req.directory + '/partials/posts_list.ejs', {
				bundle,
				moment
			});
		} else {
			return res.render(req.directory + '/user_page.ejs', {
				template: 'posts_list',
				selection: 4,
				moment,
				pnid,
				numPosts,
				userContent,
				userSettings,
				bundle,
				account_server: config.account_server_domain.slice(8),
				link,
				friends,
				parentUserContent,
				isActive: isDateInRange(userSettings.last_active, 10)
			});
		}
	}

	if (req.params.type === 'friends') {
		followers = await SETTINGS.find({ pid: friends });
		communities = [];
		selection = 1;
	} else if (req.params.type === 'followers') {
		followers = await database.getFollowingUsers(userContent);
		communities = [];
		selection = 3;
	} else {
		followers = await database.getFollowedUsers(userContent);
		communities = userContent.followed_communities;
		communityMap = await util.getCommunityHash();
		selection = 2;
	}

	if (followers[0] === '0') {
		followers.splice(0, 0);
	}
	if (communities[0] === '0') {
		communities.splice(0, 1);
	}

	const bundle = {
		followers: followers ? followers : [],
		communities: communities,
		communityMap: communityMap
	};

	if (req.query.pjax) {
		return res.render(req.directory + '/partials/following_list.ejs', {
			bundle
		});
	}
	res.render(req.directory + '/user_page.ejs', {
		template: 'following_list',
		selection: selection,
		moment,
		pnid,
		numPosts,
		userContent,
		userSettings,
		bundle,
		account_server: config.account_server_domain.slice(8),
		link,
		parentUserContent,
		isActive: isDateInRange(userSettings.last_active, 10)
	});
}

async function morePosts(req, res, userID) {
	let offset = parseInt(req.query.offset);
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
	if (!offset) {
		offset = 0;
	}
	const posts = await database.getUserPostsOffset(userID, config.post_limit, offset);

	const bundle = {
		posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		link: `/users/${userID}/more?offset=${offset + posts.length}&pjax=true`
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
}

async function moreYeahPosts(req, res, userID) {
	let offset = parseInt(req.query.offset);
	const userContent = await database.getUserContent(userID);
	const communityMap = await util.getCommunityHash();
	if (!offset) {
		offset = 0;
	}
	const posts = await POST.find({ yeahs: userID, removed: false }).sort({ created_at: -1 }).skip(offset).limit(config.post_limit);

	const bundle = {
		posts: posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		link: `/users/${userID}/yeahs/more?offset=${offset + posts.length}&pjax=true`
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
}

function isDateInRange(date, minutes) {
	// return false;
	const now = new Date();
	const tenMinutesAgo = new Date(now.getTime() - minutes * 60 * 1000);
	// console.log('last active: ' + date);
	// console.log('ten min ago: ' + tenMinutesAgo);
	return date >= tenMinutesAgo && date <= now;
}

module.exports = router;
