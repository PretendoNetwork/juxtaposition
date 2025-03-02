const crypto = require('crypto');
const express = require('express');
const moment = require('moment');
const multer = require('multer');
const database = require('../../../../database');
const { POST } = require('../../../../models/post');
const { SETTINGS } = require('../../../../models/settings');
const { COMMUNITY } = require('../../../../models/communities');
const util = require('../../../../util');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const config = require('../../../../../config.json');
const router = express.Router();

router.get('/posts', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const reports = await database.getAllOpenReports();
	const communityMap = await util.getCommunityHash();
	const userContent = await database.getUserContent(req.pid);
	const userMap = util.getUserHash();
	const postIDs = reports.map(obj => obj.post_id);

	const posts = await POST.aggregate([
		{ $match: { id: { $in: postIDs } } },
		{
			$addFields: {
				__order: { $indexOfArray: [postIDs, '$id'] }
			}
		},
		{ $sort: { __order: 1 } },
		{ $project: { index: 0, _id: 0 } }
	]);

	res.render(req.directory + '/reports.ejs', {
		moment: moment,
		userMap,
		communityMap,
		userContent,
		reports,
		posts
	});
});

router.get('/accounts', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const page = req.query.page ? parseInt(req.query.page) : 0;
	const search = req.query.search;
	const limit = 20;

	const users = search ? await database.getUserSettingsFuzzySearch(search, limit, page * limit) : await database.getUsersContent(limit, page * limit);
	const userMap = await util.getUserHash();
	const userCount = await SETTINGS.count();
	const activeUsers = await SETTINGS.find({
		last_active: {
			$gte: new Date(Date.now() - 10 * 60 * 1000)
		}
	}).count();

	res.render(req.directory + '/users.ejs', {
		moment: moment,
		userMap,
		users,
		page,
		search,
		userCount,
		activeUsers
	});
});

router.get('/accounts/:pid', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}
	const pnid = await util.getUserDataFromPid(req.params.pid).catch((e) => {
		console.error(e.details);
	});
	const userContent = await database.getUserContent(req.params.pid);
	if (isNaN(req.params.pid) || !pnid || !userContent) {
		return res.redirect('/404');
	}
	const userSettings = await database.getUserSettings(req.params.pid);
	const posts = await database.getNumberUserPostsByID(req.params.pid, config.post_limit);
	const communityMap = await util.getCommunityHash();

	res.render(req.directory + '/moderate_user.ejs', {
		moment: moment,
		userSettings,
		userContent,
		posts,
		communityMap,
		pnid
	});
});

router.post('/accounts/:pid', async (req, res) => {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const { pid } = req.params;
	await SETTINGS.findOneAndUpdate({ pid: pid }, {
		account_status: req.body.account_status,
		ban_lift_date: req.body.ban_lift_date,
		banned_by: req.pid,
		ban_reason: req.body.ban_reason
	});

	res.json({
		error: false
	});

	if (req.body.account_status === 1) {
		await util.newNotification({
			pid: pid,
			type: 'notice',
			text: `You have been limited from posting until ${moment(req.body.ban_lift_date)}. Reason: "${req.body.ban_reason}". If you have any questions contact the moderators in the Discord server or forum.`,
			image: '/images/bandwidthalert.png',
			link: '/titles/2551084080/new'
		});
	}
});

router.delete('/:reportID', async function (req, res) {
	if (!res.locals.moderator) {
		return res.sendStatus(401);
	}

	const report = await database.getReportById(req.params.reportID);
	if (!report) {
		return res.sendStatus(402);
	}
	const post = await database.getPostByID(report.post_id);
	if (!post) {
		return res.sendStatus(404);
	}
	const reason = req.query.reason ? req.query.reason : 'Removed by moderator';
	await post.removePost(reason, req.pid);
	await report.resolve(req.pid, reason);

	await util.newNotification({
		pid: post.pid,
		type: 'notice',
		text: `Your post "${post.id}" has been removed for the following reason: "${reason}"`,
		image: '/images/bandwidthalert.png',
		link: '/titles/2551084080/new'
	});

	return res.sendStatus(200);
});

router.put('/:reportID', async function (req, res) {
	if (!res.locals.moderator) {
		return res.sendStatus(401);
	}

	const report = await database.getReportById(req.params.reportID);
	if (!report) {
		return res.sendStatus(402);
	}

	await report.resolve(req.pid, req.query.reason);

	return res.sendStatus(200);
});

router.get('/communities', async function (req, res) {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	const page = req.query.page ? parseInt(req.query.page) : 0;
	const search = req.query.search;
	const limit = 20;

	const communities = search ? await database.getCommunitiesFuzzySearch(search, limit, page * limit) : await database.getCommunities(limit, page * limit);

	res.render(req.directory + '/manage_communities.ejs', {
		moment: moment,
		communities,
		page,
		search
	});
});

router.get('/communities/new', async function (req, res) {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	res.render(req.directory + '/new_community.ejs', {
		moment: moment
	});
});

router.post('/communities/new', upload.fields([{ name: 'browserIcon', maxCount: 1 }, { name: 'CTRbrowserHeader', maxCount: 1 }, { name: 'WiiUbrowserHeader', maxCount: 1 }]), async (req, res) => {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}
	const communityID = await generateCommunityUID();
	if (!req.files || !req.files.browserIcon || !req.files.CTRbrowserHeader || !req.files.WiiUbrowserHeader) {
		return res.sendStatus(422);
	}

	// browser icon
	const icon128 = await util.resizeImage(req.files.browserIcon[0].buffer.toString('base64'), 128, 128);
	const icon64 = await util.resizeImage(req.files.browserIcon[0].buffer.toString('base64'), 64, 64);
	const icon32 = await util.resizeImage(req.files.browserIcon[0].buffer.toString('base64'), 32, 32);

	if (!await util.uploadCDNAsset(`icons/${communityID}/128.png`, icon128, 'public-read') ||
		!await util.uploadCDNAsset(`icons/${communityID}/64.png`, icon64, 'public-read') ||
		!await util.uploadCDNAsset(`icons/${communityID}/32.png`, icon32, 'public-read')) {
		return res.sendStatus(422);
	}

	// TGA icon
	const tgaIcon = await util.getTGAFromPNG(icon128);
	// 3DS Header
	const CTRHeader = await util.resizeImage(req.files.CTRbrowserHeader[0].buffer.toString('base64'), 400, 220);
	// Wii U Header
	const WiiUHeader = await util.resizeImage(req.files.WiiUbrowserHeader[0].buffer.toString('base64'), 1280, 180);

	if (!await util.uploadCDNAsset(`headers/${communityID}/3DS.png`, CTRHeader, 'public-read') ||
		!await util.uploadCDNAsset(`headers/${communityID}/WiiU.png`, WiiUHeader, 'public-read')) {
		return res.sendStatus(422);
	}

	const document = {
		platform_id: req.body.platform,
		name: req.body.name,
		description: req.body.description,
		open: true,
		allows_comments: true,
		type: req.body.type,
		parent: req.body.parent === 'null' || req.body.parent.trim() === '' ? null : req.body.parent,
		owner: req.pid,
		created_at: moment(new Date()),
		empathy_count: 0,
		followers: 0,
		has_shop_page: req.body.has_shop_page,
		icon: tgaIcon,
		title_id: req.body.title_ids.replace(/ /g, '').split(','),
		community_id: communityID,
		olive_community_id: communityID,
		is_recommended: req.body.is_recommended,
		app_data: req.body.app_data
	};
	const newCommunity = new COMMUNITY(document);
	await newCommunity.save();
	res.redirect(`/admin/communities/${communityID}`);

	util.updateCommunityHash(document);
});

router.get('/communities/:community_id', async function (req, res) {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	const community = await COMMUNITY.findOne({ olive_community_id: req.params.community_id }).exec();

	if (!community) {
		return res.redirect('/titles/show');
	}

	res.render(req.directory + '/edit_community.ejs', {
		moment: moment,
		community
	});
});

router.post('/communities/:id', upload.fields([{ name: 'browserIcon', maxCount: 1 }, {
	name: 'CTRbrowserHeader',
	maxCount: 1
}, { name: 'WiiUbrowserHeader', maxCount: 1 }]), async (req, res) => {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	JSON.parse(JSON.stringify(req.files));
	const communityID = req.params.id;
	let tgaIcon;

	// browser icon
	if (req.files.browserIcon) {
		const icon128 = await util.resizeImage(req.files.browserIcon[0].buffer.toString('base64'), 128, 128);
		const icon64 = await util.resizeImage(req.files.browserIcon[0].buffer.toString('base64'), 64, 64);
		const icon32 = await util.resizeImage(req.files.browserIcon[0].buffer.toString('base64'), 32, 32);

		if (!await util.uploadCDNAsset(`icons/${communityID}/128.png`, icon128, 'public-read') ||
			!await util.uploadCDNAsset(`icons/${communityID}/64.png`, icon64, 'public-read') ||
			!await util.uploadCDNAsset(`icons/${communityID}/32.png`, icon32, 'public-read')) {
			return res.sendStatus(422);
		}

		// TGA icon
		tgaIcon = await util.getTGAFromPNG(icon128);
	}
	// 3DS Header
	if (req.files.CTRbrowserHeader) {
		const CTRHeader = await util.resizeImage(req.files.CTRbrowserHeader[0].buffer.toString('base64'), 400, 220);
		if (!await util.uploadCDNAsset(`headers/${communityID}/3DS.png`, CTRHeader, 'public-read')) {
			return res.sendStatus(422);
		}
	}

	// Wii U Header
	if (req.files.WiiUbrowserHeader) {
		const WiiUHeader = await util.resizeImage(req.files.WiiUbrowserHeader[0].buffer.toString('base64'), 1280, 180);
		if (!await util.uploadCDNAsset(`headers/${communityID}/WiiU.png`, WiiUHeader, 'public-read')) {
			return res.sendStatus(422);
		}
	}

	const document = {
		type: req.body.type,
		has_shop_page: req.body.has_shop_page,
		platform_id: req.body.platform,
		icon: tgaIcon,
		title_id: req.body.title_ids.replace(/ /g, '').split(','),
		parent: req.body.parent === 'null' || req.body.parent.trim() === '' ? null : req.body.parent,
		app_data: req.body.app_data,
		is_recommended: req.body.is_recommended,
		name: req.body.name,
		description: req.body.description
	};
	await COMMUNITY.findOneAndUpdate({ community_id: communityID }, { $set: document }, { upsert: true }).exec();

	res.redirect(`/admin/communities/${communityID}`);

	util.updateCommunityHash(document);
});

router.delete('/communities/:id', async (req, res) => {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	const { id } = req.params;

	await COMMUNITY.findByIdAndRemove(id).exec();

	res.json({
		error: false
	});
});

async function generateCommunityUID(length) {
	let id = crypto.getRandomValues(new Uint32Array(1)).toString().substring(0, length);
	const inuse = await COMMUNITY.findOne({ community_id: id });
	id = (inuse ? await generateCommunityUID(length) : id);
	return id;
}

module.exports = router;
