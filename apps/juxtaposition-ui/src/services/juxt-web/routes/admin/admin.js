const crypto = require('crypto');
const express = require('express');
const moment = require('moment');
const multer = require('multer');
const database = require('@/database');
const { POST } = require('@/models/post');
const { SETTINGS } = require('@/models/settings');
const { COMMUNITY } = require('@/models/communities');
const util = require('@/util');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { config } = require('@/config');
const { logger } = require('@/logger');
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
		logger.error(e, `Could not fetch userdata for ${req.params.pid}`);
	});
	const userContent = await database.getUserContent(req.params.pid);
	if (isNaN(req.params.pid) || !pnid || !userContent) {
		return res.redirect('/404');
	}
	const userSettings = await database.getUserSettings(req.params.pid);
	const posts = await database.getNumberUserPostsByID(req.params.pid, config.postLimit);
	const communityMap = await util.getCommunityHash();
	const userMap = util.getUserHash();
	const reasonMap = util.getReasonMap();

	const reports = await database.getReportsByOffender(req.params.pid, 0, 5);
	const submittedReports = await database.getReportsByReporter(req.params.pid, 0, 5);
	const postIDs = reports.concat(submittedReports).map(obj => obj.post_id);

	const postsMap = await POST.aggregate([
		{ $match: { id: { $in: postIDs } } },
		{
			$addFields: {
				__order: { $indexOfArray: [postIDs, '$id'] }
			}
		},
		{ $sort: { __order: 1 } },
		{ $project: { index: 0, _id: 0 } }
	]);

	const removedPosts = await POST.find({ pid: req.params.pid, removed: true }).sort({ removed_at: -1 }).limit(10);

	const auditLog = await database.getLogsForTarget(req.params.pid, 0, 20);

	res.render(req.directory + '/moderate_user.ejs', {
		moment: moment,
		userSettings,
		userContent,
		pnid,

		posts,
		removedPosts,

		reports,
		submittedReports,

		userMap,
		communityMap,
		postsMap,
		reasonMap,

		auditLog
	});
});

router.post('/accounts/:pid', async (req, res) => {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const { pid } = req.params;
	const oldUserSettings = await database.getUserSettings(pid);

	if (!oldUserSettings) {
		res.json({
			error: true
		});
		return;
	}

	if (req.body.ban_lift_date == '') {
		req.body.ban_lift_date = null;
	}

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

	let action = 'UPDATE_USER';
	const changes = [];
	const fields = [];

	if (oldUserSettings.account_status !== req.body.account_status) {
		const oldStatus = getAccountStatus(oldUserSettings.account_status);
		const newStatus = getAccountStatus(req.body.account_status);

		switch (req.body.account_status) {
			case 0:
				action = 'UNBAN';
				break;
			case 1:
				action = 'LIMIT_POSTING';
				break;
			case 2:
				action = 'TEMP_BAN';
				break;
			case 3:
				action = 'PERMA_BAN';
				break;
			default:
				action = 'PERMA_BAN';
				break;
		}
		fields.push('account_status');
		changes.push(`Account Status changed from "${oldStatus}" to "${newStatus}"`);
	}

	if (oldUserSettings.ban_lift_date !== req.body.ban_lift_date) {
		fields.push('ban_lift_date');
		changes.push(`User Ban Lift Date changed from "${oldUserSettings.ban_lift_date}" to "${req.body.ban_lift_date}"`);
	}

	if (oldUserSettings.ban_reason !== req.body.ban_reason) {
		fields.push('ban_reason');
		changes.push(`Ban reason changed from "${oldUserSettings.ban_reason}" to "${req.body.ban_reason}"`);
	}

	if (changes.length > 0) {
		await util.createLogEntry(
			req.pid,
			action,
			pid,
			changes.join('\n'),
			fields
		);
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

	const postType = post.parent ? 'comment' : 'post';

	await util.newNotification({
		pid: post.pid,
		type: 'notice',
		text: `Your ${postType} "${post.id}" has been removed for the following reason: "${reason}"`,
		image: '/images/bandwidthalert.png',
		link: '/titles/2551084080/new'
	});

	await util.createLogEntry(
		req.pid,
		'REMOVE_POST',
		post.id,
		`Post ${post.id} removed for: "${reason}"`
	);

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

	await util.createLogEntry(
		req.pid,
		'IGNORE_REPORT',
		report.id,
		`Report ${report.id} ignored for: "${req.query.reason}"`
	);

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

	req.body.has_shop_page = req.body.has_shop_page === 'on' ? 1 : 0;
	req.body.is_recommended = req.body.is_recommended === 'on' ? 1 : 0;

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

	const communityType = getCommunityType(document.type);
	const communityPlatform = getCommunityPlatform(document.platform_id);
	const changes = [];

	changes.push(`Name set to "${document.name}"`);
	changes.push(`Description set to "${document.description}"`);
	changes.push(`Platform ID set to "${communityPlatform}"`);
	changes.push(`Type set to "${communityType}"`);
	changes.push(`Title IDs set to "${document.title_id.join(', ')}"`);
	changes.push(`Parent set to "${document.parent}"`);
	changes.push(`App data set to "${document.app_data}"`);
	changes.push(`Is Recommended set to "${document.is_recommended}"`);
	changes.push(`Has Shop Page set to "${document.has_shop_page}"`);

	const fields = [
		'name',
		'description',
		'platform_id',
		'type',
		'title_id',
		'browserIcon',
		'CTRbrowserHeader',
		'WiiUbrowserHeader',
		'parent',
		'app_data',
		'is_recommended',
		'has_shop_page'
	];
	await util.createLogEntry(
		req.pid,
		'MAKE_COMMUNITY',
		communityID,
		changes.join('\n'),
		fields
	);
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

	const oldCommunity = await COMMUNITY.findOne({ olive_community_id: communityID }).exec();

	if (!oldCommunity) {
		return res.redirect('/404');
	}

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

	req.body.has_shop_page = req.body.has_shop_page === 'on' ? 1 : 0;
	req.body.is_recommended = req.body.is_recommended === 'on' ? 1 : 0;

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
	await COMMUNITY.findOneAndUpdate({ olive_community_id: communityID }, { $set: document }, { upsert: true }).exec();

	res.redirect(`/admin/communities/${communityID}`);

	util.updateCommunityHash(document);

	// determine the changes made to the community
	const changes = [];
	const fields = [];

	if (oldCommunity.name !== document.name) {
		fields.push('name');
		changes.push(`Name changed from "${oldCommunity.name}" to "${document.name}"`);
	}
	if (oldCommunity.description !== document.description) {
		fields.push('description');
		changes.push(`Description changed from "${oldCommunity.description}" to "${document.description}"`);
	}
	if (oldCommunity.platform_id !== parseInt(document.platform_id)) {
		const oldCommunityPlatform = getCommunityPlatform(oldCommunity.platform_id);
		const newCommunityPlatform = getCommunityPlatform(document.platform_id);
		fields.push('platform_id');
		changes.push(`Platform ID changed from "${oldCommunityPlatform}" to "${newCommunityPlatform}"`);
	}
	if (oldCommunity.type !== parseInt(document.type)) {
		const oldCommunityType = getCommunityType(oldCommunity.type);
		const newCommunityType = getCommunityType(document.type);
		fields.push('type');
		changes.push(`Type changed from "${oldCommunityType}" to "${newCommunityType}"`);
	}
	if (oldCommunity.title_id.toString() !== document.title_id.toString()) {
		fields.push('title_id');
		changes.push(`Title IDs changed from "${oldCommunity.title_id.join(', ')}" to "${document.title_id.join(', ')}"`);
	}
	if (req.files.browserIcon) {
		fields.push('browserIcon');
		changes.push('Icon changed');
	}
	if (req.files.CTRbrowserHeader) {
		fields.push('CTRbrowserHeader');
		changes.push('3DS Banner changed');
	}
	if (req.files.WiiUbrowserHeader) {
		fields.push('WiiUbrowserHeader');
		changes.push('Wii U Banner changed');
	}
	if (oldCommunity.parent !== document.parent) {
		fields.push('parent');
		changes.push(`Parent changed from "${oldCommunity.parent}" to "${document.parent}"`);
	}
	if (oldCommunity.app_data !== document.app_data) {
		fields.push('app_data');
		changes.push(`App data changed from "${oldCommunity.app_data}" to "${document.app_data}"`);
	}
	if (oldCommunity.is_recommended !== document.is_recommended) {
		fields.push('is_recommended');
		changes.push(`Is Recommended changed from "${oldCommunity.is_recommended}" to "${document.is_recommended}"`);
	}
	if (oldCommunity.has_shop_page !== document.has_shop_page) {
		fields.push('has_shop_page');
		changes.push(`Has Shop Page changed from "${oldCommunity.has_shop_page}" to "${document.has_shop_page}"`);
	}

	if (changes.length > 0) {
		await util.createLogEntry(
			req.pid,
			'UPDATE_COMMUNITY',
			oldCommunity.olive_community_id,
			changes.join('\n'),
			fields
		);
	}
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

	await util.createLogEntry(
		req.pid,
		'DELETE_COMMUNITY',
		id,
		`Community ${id} deleted`
	);
});

async function generateCommunityUID(length) {
	let id = crypto.getRandomValues(new Uint32Array(1)).toString().substring(0, length);
	const inuse = await COMMUNITY.findOne({ community_id: id });
	id = (inuse ? await generateCommunityUID(length) : id);
	return id;
}

function getAccountStatus(status) {
	switch (status) {
		case 0:
			return 'Normal';
		case 1:
			return 'Limited from Posting';
		case 2:
			return 'Temporary Ban';
		case 3:
			return 'Permanent Ban';
		default:
			return `Unknown (${status})`;
	}
}

function getCommunityType(type) {
	type = Number(type);
	switch (type) {
		case 0:
			return 'Main';
		case 1:
			return 'Sub';
		case 2:
			return 'Announcement';
		case 3:
			return 'Private';
		default:
			return `Unknown (${type})`;
	}
}

function getCommunityPlatform(platform_id) {
	platform_id = Number(platform_id);
	switch (platform_id) {
		case 0:
			return 'Wii U';
		case 1:
			return '3DS';
		case 2:
			return 'Both';
		default:
			return `Unknown (${platform_id})`;
	}
}

module.exports = router;
