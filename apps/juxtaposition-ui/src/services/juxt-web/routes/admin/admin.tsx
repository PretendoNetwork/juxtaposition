import crypto from 'crypto';
import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { deletePostById, getPostById } from '@/api/post';
import { database } from '@/database';
import { uploadHeaders, uploadIcons } from '@/images';
import { logger } from '@/logger';
import { COMMUNITY } from '@/models/communities';
import { POST } from '@/models/post';
import { SETTINGS } from '@/models/settings';
import { humanDate, createLogEntry, getReasonMap, getUserAccountData, newNotification, updateCommunityHash } from '@/util';
import { getUserMetrics } from '@/metrics';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebUserListView } from '@/services/juxt-web/views/web/admin/userListView';
import { buildContext } from '@/services/juxt-web/views/context';
import { WebReportListView } from '@/services/juxt-web/views/web/admin/reportListView';
import { WebManageCommunityView } from '@/services/juxt-web/views/web/admin/manageCommunityView';
import { WebNewCommunityView } from '@/services/juxt-web/views/web/admin/newCommunityView';
import { WebEditCommunityView } from '@/services/juxt-web/views/web/admin/editCommunityView';
import { WebModerateUserView } from '@/services/juxt-web/views/web/admin/moderateUserView';
import type { HydratedSettingsDocument } from '@/models/settings';
import type { HydratedReportDocument } from '@/models/report';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
export const adminRouter = express.Router();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Too difficult to type
const onOffSchema = () => z.enum(['on', 'off']).default('off').transform(v => v === 'on' ? 1 : 0);

adminRouter.get('/posts', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}
	const { auth } = parseReq(req);

	// `any` is needed because database.js is not typed yet
	const reports: HydratedReportDocument[] = await database.getAllOpenReports() as any;
	const userContent = await database.getUserContent(auth().pid);
	const postIDs = reports.map(obj => obj.post_id);

	if (!userContent) {
		throw new Error('User content is null');
	}

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

	res.jsxForDirectory({
		web: <WebReportListView ctx={buildContext(res)} reasonMap={getReasonMap()} posts={posts} userContent={userContent} reports={reports} />
	});
});

async function tryGetSettingsFromPidString(pid_string: string): Promise<HydratedSettingsDocument | null> {
	// Check the string is all digits
	if (!/^\d+$/g.test(pid_string)) {
		return null;
	}

	// Parse it
	const pid = parseInt(pid_string, 10);
	if (isNaN(pid)) {
		return null;
	}

	// Get the user doc
	const user = await database.getUserSettings(pid);
	if (user === null) {
		return null;
	}

	return user;
}

adminRouter.get('/accounts', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const { query } = parseReq(req, {
		query: z.object({
			page: z.coerce.number().default(0),
			search: z.string().trim().optional()
		})
	});

	const page = query.page;
	const search = query.search;
	const limit = 20;

	const users = await (async (): Promise<HydratedSettingsDocument[]> => {
		if (!search) {
			return database.getUsersSettings(limit, page * limit);
		}
		const results = [];

		const pid_user = await tryGetSettingsFromPidString(search);
		if (pid_user !== null) {
			results.push(pid_user);
		}

		const miis = await database.getUserSettingsFuzzySearch(search, limit, page * limit);
		results.push(...miis);

		return results;
	})();

	const userMetrics = await getUserMetrics();

	res.jsxForDirectory({
		web: <WebUserListView ctx={buildContext(res)} users={users} page={page} search={search} userCount={userMetrics.totalUsers} activeCount={userMetrics.currentOnlineUsers} />
	});
});

adminRouter.get('/accounts/:pid', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const { params } = parseReq(req, {
		params: z.object({
			pid: z.coerce.number()
		})
	});

	const reqPid = params.pid;

	const pnid = await getUserAccountData(reqPid).catch((e) => {
		logger.error(e, `Could not fetch userdata for ${reqPid}`);
	});
	const userContent = await database.getUserContent(reqPid);
	const userSettings = await database.getUserSettings(reqPid);
	if (isNaN(reqPid) || !pnid || !userContent || !userSettings) {
		return res.redirect('/404');
	}

	// `any` is needed because database.js is not typed yet
	const reports: HydratedReportDocument[] = await database.getReportsByOffender(reqPid, 0, 50) as any;
	const submittedReports: HydratedReportDocument[] = await database.getReportsByReporter(reqPid, 0, 50) as any;
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

	const removedPosts = await POST.find({ pid: reqPid, removed: true }).sort({ removed_at: -1 }).limit(50);

	const auditLog = await database.getLogsForTarget(reqPid, 0, 50);

	res.jsxForDirectory({
		web: (
			<WebModerateUserView
				ctx={buildContext(res)}
				userSettings={userSettings}
				userContent={userContent}
				pnid={pnid}
				removedPosts={removedPosts}

				reports={reports}
				submittedReports={submittedReports}
				auditLog={auditLog}

				postsMap={postsMap}
				reasonMap={getReasonMap()}
			/>
		)
	});
});

adminRouter.post('/accounts/:pid', async (req, res) => {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const { params, body, auth } = parseReq(req, {
		params: z.object({
			pid: z.coerce.number()
		}),
		body: z.object({
			// Empty string counts as null
			ban_lift_date: z.string().trim().nullable().transform(v => v === '' ? null : v)
				.pipe(z.iso.datetime().nullable()),
			account_status: z.number(),
			ban_reason: z.string().trim().nullable().transform(v => v === '' ? null : v)
		}).transform((v) => {
			if (v.account_status == 0) {
				v.ban_lift_date = null; // If account status is normal, remove ban date
			}
			return v;
		})
	});

	const pid = params.pid;
	const oldUserSettings = await database.getUserSettings(pid);

	if (!oldUserSettings) {
		res.json({
			error: true
		});
		return;
	}

	await SETTINGS.findOneAndUpdate({ pid: pid }, {
		account_status: body.account_status,
		ban_lift_date: body.ban_lift_date,
		banned_by: req.pid,
		ban_reason: body.ban_reason
	});

	res.json({
		error: false
	});

	if (body.account_status === 1) {
		await newNotification({
			pid: pid,
			type: 'notice',
			text: `You have been Limited from Posting until ${humanDate(body.ban_lift_date)}. ` +
				(body.ban_reason ? `Reason: "${body.ban_reason}". ` : '') +
				`Click this message to view the Juxtaposition Code of Conduct. ` +
				`If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).`,
			image: '/images/bandwidthalert.png',
			link: '/titles/2551084080/new'
		});
	}

	let action = 'UPDATE_USER';
	const accountStatusChanged = oldUserSettings.account_status !== body.account_status;
	const changes = [];
	const fields = [];

	if (accountStatusChanged) {
		const oldStatus = getAccountStatus(oldUserSettings.account_status);
		const newStatus = getAccountStatus(body.account_status);

		switch (body.account_status) {
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

	if (accountStatusChanged || oldUserSettings.ban_lift_date !== body.ban_lift_date) {
		fields.push('ban_lift_date');
		changes.push(`User Ban Lift Date changed from "${humanDate(oldUserSettings.ban_lift_date)}" to "${humanDate(body.ban_lift_date)}"`);
	}

	if (accountStatusChanged || oldUserSettings.ban_reason !== body.ban_reason) {
		fields.push('ban_reason');
		changes.push(`Ban reason changed from "${oldUserSettings.ban_reason}" to "${body.ban_reason}"`);
	}

	if (changes.length > 0) {
		await createLogEntry(
			auth().pid,
			action,
			pid.toString(),
			changes.join('\n'),
			fields
		);
	}
});

adminRouter.delete('/:reportID', async function (req, res) {
	if (!res.locals.moderator) {
		return res.sendStatus(401);
	}

	const { params, query, auth } = parseReq(req, {
		params: z.object({
			reportID: z.string()
		}),
		query: z.object({
			reason: z.string().trim().optional()
		})
	});

	// `any` is needed because database.js is not typed yet
	const report: HydratedReportDocument | null = await database.getReportById(params.reportID) as any;
	if (!report) {
		return res.sendStatus(402);
	}
	const post = await getPostById(auth().tokens, report.post_id);
	if (post === null) {
		return res.sendStatus(404);
	}
	const reason = query.reason ?? 'Removed by moderator';
	await deletePostById(auth().tokens, post.id, reason);
	await report.resolve(auth().pid, reason);

	const postType = post.parent ? 'comment' : 'post';

	await newNotification({
		pid: post.pid,
		type: 'notice',
		text: `Your ${postType} "${post.id}" has been removed` +
			(reason ? ` for the following reason: "${reason}". ` : '. ') +
			`Click this message to view the Juxtaposition Code of Conduct. ` +
			`If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/juxt-mods/).`,
		image: '/images/bandwidthalert.png',
		link: '/titles/2551084080/new'
	});

	await createLogEntry(
		auth().pid,
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

	const { params, query, auth } = parseReq(req, {
		params: z.object({
			reportID: z.string()
		}),
		query: z.object({
			reason: z.string().trim().optional()
		})
	});

	// `any` is needed because database.js is not typed yet
	const report: HydratedReportDocument | null = await database.getReportById(params.reportID) as any;
	if (!report) {
		return res.sendStatus(402);
	}

	await report.resolve(auth().pid, query.reason ?? null);

	await createLogEntry(
		auth().pid,
		'IGNORE_REPORT',
		report.id,
		`Report ${report.id} ignored for: "${query.reason ?? 'No reason provided'}"`
	);

	return res.sendStatus(200);
});

adminRouter.get('/communities', async function (req, res) {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	const { query } = parseReq(req, {
		query: z.object({
			page: z.coerce.number().default(0),
			search: z.string().trim().optional()
		})
	});

	const page = query.page;
	const search = query.search;
	const limit = 20;

	const communities = search ? await database.getCommunitiesFuzzySearch(search, limit, page * limit) : await database.getCommunities(limit, page * limit);

	res.jsxForDirectory({
		web: <WebManageCommunityView ctx={buildContext(res)} hasNextPage={communities.length === limit} communities={communities} page={page} search={search} />
	});
});

adminRouter.get('/communities/new', async function (req, res) {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	res.jsxForDirectory({
		web: <WebNewCommunityView ctx={buildContext(res)} />
	});
});

adminRouter.post('/communities/new', upload.fields([{ name: 'browserIcon', maxCount: 1 }, { name: 'CTRbrowserHeader', maxCount: 1 }, { name: 'WiiUbrowserHeader', maxCount: 1 }]), async (req, res) => {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	const { body, files, auth } = parseReq(req, {
		body: z.object({
			has_shop_page: onOffSchema(),
			is_recommended: onOffSchema(),
			platform: z.string().trim(),
			name: z.string().trim(),
			description: z.string().trim(),
			type: z.coerce.number().min(0).max(3),
			parent: z.string().trim().nullable().transform(v => v === 'null' || v === '' ? null : v),
			title_ids: z.string().trim()
				.transform(v => v.replaceAll(' ', '').split(',').filter(v => v.length > 0))
				.pipe(z.array(z.string().min(1))),
			app_data: z.string().trim(),
			shot_mode: z.enum(['allow', 'block', 'force']),
			shot_extra_title_id: z.string().trim()
				.transform(v => v.replaceAll(' ', '').split(',').filter(v => v.length > 0))
				.pipe(z.array(z.string().min(1)))
		}),
		files: ['browserIcon', 'CTRbrowserHeader', 'WiiUbrowserHeader']
	});

	const communityId = await generateCommunityUID();
	if (files.browserIcon.length === 0 || files.CTRbrowserHeader.length === 0 || files.WiiUbrowserHeader.length === 0) {
		return res.sendStatus(422);
	}

	const icons = await uploadIcons({
		icon: files.browserIcon[0].buffer,
		communityId
	});
	const headers = await uploadHeaders({
		ctr_header: files.CTRbrowserHeader[0].buffer,
		wup_header: files.WiiUbrowserHeader[0].buffer,
		communityId
	});
	if (icons === null || headers === null) {
		return res.sendStatus(422);
	}

	const document = {
		platform_id: body.platform,
		name: body.name,
		description: body.description,
		open: true,
		allows_comments: true,
		type: body.type,
		parent: body.parent,
		owner: auth().pid,
		created_at: new Date(),
		empathy_count: 0,
		followers: 0,
		has_shop_page: body.has_shop_page,
		icon: icons.tgaBlob,
		ctr_header: headers.ctr,
		wup_header: headers.wup,
		title_id: body.title_ids,
		community_id: communityId,
		olive_community_id: communityId,
		is_recommended: body.is_recommended,
		app_data: body.app_data,
		shot_mode: body.shot_mode,
		shot_extra_title_id: body.shot_extra_title_id
	};
	const newCommunity = new COMMUNITY(document);
	await newCommunity.save();
	res.redirect(`/admin/communities/${communityId}`);

	updateCommunityHash(newCommunity);

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
		auth().pid,
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

	const { params } = parseReq(req, {
		params: z.object({
			community_id: z.string()
		})
	});

	const community = await COMMUNITY.findOne({ olive_community_id: params.community_id }).exec();

	if (!community) {
		return res.redirect('/titles/show');
	}

	res.jsxForDirectory({
		web: <WebEditCommunityView ctx={buildContext(res)} community={community} />
	});
});

adminRouter.post('/communities/:id', upload.fields([{ name: 'browserIcon', maxCount: 1 }, {
	name: 'CTRbrowserHeader',
	maxCount: 1
}, { name: 'WiiUbrowserHeader', maxCount: 1 }]), async (req, res) => {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	const { body, params, files, auth } = parseReq(req, {
		params: z.object({
			id: z.string()
		}),
		body: z.object({
			has_shop_page: onOffSchema(),
			is_recommended: onOffSchema(),
			platform: z.string().trim(),
			name: z.string().trim(),
			description: z.string().trim(),
			type: z.coerce.number().min(0).max(3),
			parent: z.string().trim().nullable().transform(v => v === 'null' || v === '' ? null : v),
			title_ids: z.string().trim()
				.transform(v => v.replaceAll(' ', '').split(',').filter(v => v.length > 0))
				.pipe(z.array(z.string().min(1))),
			app_data: z.string().trim(),
			shot_mode: z.enum(['allow', 'block', 'force']),
			shot_extra_title_id: z.string().trim()
				.transform(v => v.replaceAll(' ', '').split(',').filter(v => v.length > 0))
				.pipe(z.array(z.string().min(1)))
		}),
		files: ['browserIcon', 'CTRbrowserHeader', 'WiiUbrowserHeader']
	});

	JSON.parse(JSON.stringify(files)); // wtf does this do?
	const communityId = params.id;

	const oldCommunity = await COMMUNITY.findOne({ olive_community_id: communityId }).exec();

	if (!oldCommunity) {
		return res.redirect('/404');
	}

	// browser icon
	let icons = null;
	if (files.browserIcon.length > 0) {
		icons = await uploadIcons({
			icon: files.browserIcon[0].buffer,
			communityId
		});
		if (icons === null) {
			return res.sendStatus(422);
		}
	}
	// 3DS / Wii U Header
	let headers = null;
	if (files.CTRbrowserHeader.length > 0 && files.WiiUbrowserHeader.length > 0) {
		headers = await uploadHeaders({
			ctr_header: files.CTRbrowserHeader[0].buffer,
			wup_header: files.WiiUbrowserHeader[0].buffer,
			communityId
		});
		if (headers === null) {
			return res.sendStatus(422);
		}
	}

	const document = {
		type: body.type,
		has_shop_page: body.has_shop_page,
		platform_id: body.platform,
		icon: icons?.tgaBlob ?? oldCommunity.icon,
		ctr_header: headers?.ctr ?? oldCommunity.ctr_header,
		wup_header: headers?.wup ?? oldCommunity.wup_header,
		title_id: body.title_ids,
		parent: body.parent,
		app_data: body.app_data,
		is_recommended: body.is_recommended,
		name: body.name,
		description: body.description,
		shot_mode: body.shot_mode,
		shot_extra_title_id: body.shot_extra_title_id
	};
	const comm = await COMMUNITY.findOneAndUpdate({ olive_community_id: communityId }, { $set: document }, { upsert: true }).exec();
	if (!comm) {
		throw new Error('Can not find community after update');
	}

	res.redirect(`/admin/communities/${communityId}`);

	updateCommunityHash(comm);

	// determine the changes made to the community
	const changes = [];
	const fields = [];

	if (oldCommunity.name !== comm.name) {
		fields.push('name');
		changes.push(`Name changed from "${oldCommunity.name}" to "${comm.name}"`);
	}
	if (oldCommunity.description !== comm.description) {
		fields.push('description');
		changes.push(`Description changed from "${oldCommunity.description}" to "${comm.description}"`);
	}
	if (oldCommunity.platform_id !== comm.platform_id) {
		const oldCommunityPlatform = getCommunityPlatform(oldCommunity.platform_id);
		const newCommunityPlatform = getCommunityPlatform(comm.platform_id);
		fields.push('platform_id');
		changes.push(`Platform ID changed from "${oldCommunityPlatform}" to "${newCommunityPlatform}"`);
	}
	if (oldCommunity.type !== comm.type) {
		const oldCommunityType = getCommunityType(oldCommunity.type);
		const newCommunityType = getCommunityType(comm.type);
		fields.push('type');
		changes.push(`Type changed from "${oldCommunityType}" to "${newCommunityType}"`);
	}
	if (oldCommunity.title_id.toString() !== comm.title_id.toString()) {
		fields.push('title_id');
		changes.push(`Title IDs changed from "${oldCommunity.title_id.join(', ')}" to "${comm.title_id.join(', ')}"`);
	}
	if (files.browserIcon.length > 0) {
		fields.push('browserIcon');
		changes.push('Icon changed');
	}
	if (files.CTRbrowserHeader.length > 0) {
		fields.push('CTRbrowserHeader');
		changes.push('3DS Banner changed');
	}
	if (files.WiiUbrowserHeader.length > 0) {
		fields.push('WiiUbrowserHeader');
		changes.push('Wii U Banner changed');
	}
	if (oldCommunity.parent !== comm.parent) {
		fields.push('parent');
		changes.push(`Parent changed from "${oldCommunity.parent}" to "${comm.parent}"`);
	}
	if (oldCommunity.app_data !== comm.app_data) {
		fields.push('app_data');
		changes.push(`App data changed from "${oldCommunity.app_data}" to "${comm.app_data}"`);
	}
	if (oldCommunity.is_recommended !== comm.is_recommended) {
		fields.push('is_recommended');
		changes.push(`Is Recommended changed from "${oldCommunity.is_recommended}" to "${comm.is_recommended}"`);
	}
	if (oldCommunity.has_shop_page !== comm.has_shop_page) {
		fields.push('has_shop_page');
		changes.push(`Has Shop Page changed from "${oldCommunity.has_shop_page}" to "${comm.has_shop_page}"`);
	}

	if (changes.length > 0) {
		await createLogEntry(
			auth().pid,
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

	const { params, auth } = parseReq(req, {
		params: z.object({
			id: z.string()
		})
	});

	await COMMUNITY.findByIdAndDelete(params.id).exec();

	res.json({
		error: false
	});

	await createLogEntry(
		auth().pid,
		'DELETE_COMMUNITY',
		params.id,
		`Community ${params.id} deleted`
	);
});

async function generateCommunityUID(length?: number | undefined): Promise<string> {
	let id = crypto.getRandomValues(new Uint32Array(1)).toString().substring(0, length);
	const inuse = await COMMUNITY.findOne({ community_id: id });
	id = (inuse ? await generateCommunityUID(length) : id);
	return id;
}

function getAccountStatus(status: number): string {
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

function getCommunityType(type: number | string): string {
	const parsedType = Number(type);
	switch (parsedType) {
		case 0:
			return 'Main';
		case 1:
			return 'Sub';
		case 2:
			return 'Announcement';
		case 3:
			return 'Private';
		default:
			return `Unknown (${parsedType})`;
	}
}

function getCommunityPlatform(platform_id: number | string): string {
	const parsedPlatformId = Number(platform_id);
	switch (parsedPlatformId) {
		case 0:
			return 'Wii U';
		case 1:
			return '3DS';
		case 2:
			return 'Both';
		default:
			return `Unknown (${parsedPlatformId})`;
	}
}
