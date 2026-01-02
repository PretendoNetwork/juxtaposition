import crypto from 'crypto';
import express from 'express';
import moment from 'moment';
import multer from 'multer';
import { deletePostById, getPostById, getPostsByPoster } from '@/api/post';
import { database } from '@/database';
import { uploadHeaders, uploadIcons } from '@/images';
import { logger } from '@/logger';
import { COMMUNITY } from '@/models/communities';
import { POST } from '@/models/post';
import { SETTINGS } from '@/models/settings';
import { humanDate, createLogEntry, getCommunityHash, getReasonMap, getUserAccountData, getUserHash, newNotification, updateCommunityHash } from '@/util';
import { getUserMetrics } from '@/metrics';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
export const adminRouter = express.Router();

adminRouter.get('/posts', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const reports = await database.getAllOpenReports();
	const communityMap = await getCommunityHash();
	const userContent = await database.getUserContent(req.pid);
	const userMap = getUserHash();
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

adminRouter.get('/accounts', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const page = req.query.page ? parseInt(req.query.page) : 0;
	const search = req.query.search;
	const limit = 20;

	const users = await (async () => {
		if (!search) {
			return database.getUsersSettings(limit, page * limit);
		}
		const results = [];

		const pid = Number(search);
		if (!isNaN(pid)) {
			const user = await database.getUserSettings(pid);
			if (user !== null) {
				results.push(user);
			}
		}

		const miis = await database.getUserSettingsFuzzySearch(search, limit, page * limit);
		results.push(...miis);

		return results;
	})();

	const userMap = await getUserHash();
	const userMetrics = await getUserMetrics();

	res.render(req.directory + '/users.ejs', {
		moment: moment,
		userMap,
		users,
		page,
		search,
		userCount: userMetrics.totalUsers,
		activeUsers: userMetrics.currentOnlineUsers
	});
});

adminRouter.get('/accounts/:pid', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}
	const pnid = await getUserAccountData(req.params.pid).catch((e) => {
		logger.error(e, `Could not fetch userdata for ${req.params.pid}`);
	});
	const userContent = await database.getUserContent(req.params.pid);
	if (isNaN(req.params.pid) || !pnid || !userContent) {
		return res.redirect('/404');
	}
	const userSettings = await database.getUserSettings(req.params.pid);
	const posts = (await getPostsByPoster(req.tokens, req.params.pid, 0)).items;
	const communityMap = await getCommunityHash();
	const userMap = getUserHash();
	const reasonMap = getReasonMap();

	const reports = await database.getReportsByOffender(req.params.pid, 0, 50);
	const submittedReports = await database.getReportsByReporter(req.params.pid, 0, 50);
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

	const removedPosts = await POST.find({ pid: req.params.pid, removed: true }).sort({ removed_at: -1 }).limit(50);

	const auditLog = await database.getLogsForTarget(req.params.pid, 0, 50);

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

adminRouter.post('/accounts/:pid', async (req, res) => {
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

	if (req.body.ban_lift_date == '' || req.body.account_status == 0) {
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
		await newNotification({
			pid: pid,
			type: 'notice',
			text: `You have been Limited from Posting until ${humanDate(req.body.ban_lift_date)}. ` +
				(req.body.ban_reason ? `Reason: "${req.body.ban_reason}".` : '') +
				`Click this message to view the Juxtaposition Code of Conduct. ` +
				`If you have any questions, please contact the moderators on the Pretendo Network Forum (forum.pretendo.network).`,
			image: '/images/bandwidthalert.png',
			link: '/titles/2551084080/new'
		});
	}

	let action = 'UPDATE_USER';
	const accountStatusChanged = oldUserSettings.account_status !== req.body.account_status;
	const changes = [];
	const fields = [];

	if (accountStatusChanged) {
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

	if (accountStatusChanged || oldUserSettings.ban_lift_date !== req.body.ban_lift_date) {
		fields.push('ban_lift_date');
		changes.push(`User Ban Lift Date changed from "${humanDate(oldUserSettings.ban_lift_date)}" to "${humanDate(req.body.ban_lift_date)}"`);
	}

	if (accountStatusChanged || oldUserSettings.ban_reason !== req.body.ban_reason) {
		fields.push('ban_reason');
		changes.push(`Ban reason changed from "${oldUserSettings.ban_reason}" to "${req.body.ban_reason}"`);
	}

	if (changes.length > 0) {
		await createLogEntry(
			req.pid,
			action,
			pid,
			changes.join('\n'),
			fields
		);
	}
});

adminRouter.delete('/:reportID', async function (req, res) {
	if (!res.locals.moderator) {
		return res.sendStatus(401);
	}

	const report = await database.getReportById(req.params.reportID);
	if (!report) {
		return res.sendStatus(402);
	}
	const post = await getPostById(req.tokens, report.post_id);
	if (post === null) {
		return res.sendStatus(404);
	}
	const reason = req.query.reason ? req.query.reason : 'Removed by moderator';
	await deletePostById(req.tokens, post.id, reason);
	await report.resolve(req.pid, reason);

	const postType = post.parent ? 'comment' : 'post';

	await newNotification({
		pid: post.pid,
		type: 'notice',
		text: `Your ${postType} "${post.id}" has been removed` +
			(reason ? ` for the following reason: "${reason}"` : '.') +
			`Click this message to view the Juxtaposition Code of Conduct. ` +
			`If you have any questions, please contact the moderators on the Pretendo Network Forum (forum.pretendo.network).`,
		image: '/images/bandwidthalert.png',
		link: '/titles/2551084080/new'
	});

	await createLogEntry(
		req.pid,
		'REMOVE_POST',
		post.id,
		`Post ${post.id} removed for: "${reason}"`
	);

	return res.sendStatus(200);
});

adminRouter.put('/:reportID', async function (req, res) {
	if (!res.locals.moderator) {
		return res.sendStatus(401);
	}

	const report = await database.getReportById(req.params.reportID);
	if (!report) {
		return res.sendStatus(402);
	}

	await report.resolve(req.pid, req.query.reason);

	await createLogEntry(
		req.pid,
		'IGNORE_REPORT',
		report.id,
		`Report ${report.id} ignored for: "${req.query.reason}"`
	);

	return res.sendStatus(200);
});

adminRouter.get('/communities', async function (req, res) {
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

adminRouter.get('/communities/new', async function (req, res) {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	res.render(req.directory + '/new_community.ejs', {
		moment: moment
	});
});

adminRouter.post('/communities/new', upload.fields([{ name: 'browserIcon', maxCount: 1 }, { name: 'CTRbrowserHeader', maxCount: 1 }, { name: 'WiiUbrowserHeader', maxCount: 1 }]), async (req, res) => {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}
	const communityId = await generateCommunityUID();
	if (!req.files || !req.files.browserIcon || !req.files.CTRbrowserHeader || !req.files.WiiUbrowserHeader) {
		return res.sendStatus(422);
	}

	const icons = await uploadIcons({
		icon: req.files.browserIcon[0].buffer,
		communityId
	});
	const headers = await uploadHeaders({
		ctr_header: req.files.CTRbrowserHeader[0].buffer,
		wup_header: req.files.WiiUbrowserHeader[0].buffer,
		communityId
	});
	if (icons === null || headers === null) {
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
		icon: icons.tgaBlob,
		ctr_header: headers.ctr,
		wup_header: headers.wup,
		title_id: req.body.title_ids.replace(/ /g, '').split(','),
		community_id: communityId,
		olive_community_id: communityId,
		is_recommended: req.body.is_recommended,
		app_data: req.body.app_data
	};
	const newCommunity = new COMMUNITY(document);
	await newCommunity.save();
	res.redirect(`/admin/communities/${communityId}`);

	updateCommunityHash(document);

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
	await createLogEntry(
		req.pid,
		'MAKE_COMMUNITY',
		communityId,
		changes.join('\n'),
		fields
	);
});

adminRouter.get('/communities/:community_id', async function (req, res) {
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

adminRouter.post('/communities/:id', upload.fields([{ name: 'browserIcon', maxCount: 1 }, {
	name: 'CTRbrowserHeader',
	maxCount: 1
}, { name: 'WiiUbrowserHeader', maxCount: 1 }]), async (req, res) => {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	JSON.parse(JSON.stringify(req.files));
	const communityId = req.params.id;

	const oldCommunity = await COMMUNITY.findOne({ olive_community_id: communityId }).exec();

	if (!oldCommunity) {
		return res.redirect('/404');
	}

	// browser icon
	let icons = null;
	if (req.files.browserIcon) {
		icons = await uploadIcons({
			icon: req.files.browserIcon[0].buffer,
			communityId
		});
		if (icons === null) {
			return res.sendStatus(422);
		}
	}
	// 3DS / Wii U Header
	let headers = null;
	if (req.files.CTRbrowserHeader && req.files.WiiUbrowserHeader) {
		headers = await uploadHeaders({
			ctr_header: req.files.CTRbrowserHeader[0].buffer,
			wup_header: req.files.WiiUbrowserHeader[0].buffer,
			communityId
		});
		if (headers === null) {
			return res.sendStatus(422);
		}
	}

	req.body.has_shop_page = req.body.has_shop_page === 'on' ? 1 : 0;
	req.body.is_recommended = req.body.is_recommended === 'on' ? 1 : 0;

	const document = {
		type: req.body.type,
		has_shop_page: req.body.has_shop_page,
		platform_id: req.body.platform,
		icon: icons?.tgaBlob ?? oldCommunity.icon,
		ctr_header: headers?.ctr ?? oldCommunity.ctr_header,
		wup_header: headers?.wup ?? oldCommunity.wup_header,
		title_id: req.body.title_ids.replace(/ /g, '').split(','),
		parent: req.body.parent === 'null' || req.body.parent.trim() === '' ? null : req.body.parent,
		app_data: req.body.app_data,
		is_recommended: req.body.is_recommended,
		name: req.body.name,
		description: req.body.description
	};
	await COMMUNITY.findOneAndUpdate({ olive_community_id: communityId }, { $set: document }, { upsert: true }).exec();

	res.redirect(`/admin/communities/${communityId}`);

	updateCommunityHash(document);

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
		await createLogEntry(
			req.pid,
			'UPDATE_COMMUNITY',
			oldCommunity.olive_community_id,
			changes.join('\n'),
			fields
		);
	}
});

adminRouter.delete('/communities/:id', async (req, res) => {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	const { id } = req.params;

	await COMMUNITY.findByIdAndRemove(id).exec();

	res.json({
		error: false
	});

	await createLogEntry(
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
