import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { database } from '@/database';
import { SETTINGS } from '@/models/settings';
import { humanDate, createLogEntry, getReasonMap, newNotification, updateCommunityHashForAdminCommunity } from '@/util';
import { getPostMetrics, getUserMetrics } from '@/metrics';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebUserListView } from '@/services/juxt-web/views/web/admin/userListView';
import { WebReportListView } from '@/services/juxt-web/views/web/admin/reportListView';
import { WebManageCommunityView } from '@/services/juxt-web/views/web/admin/manageCommunityView';
import { WebNewCommunityView } from '@/services/juxt-web/views/web/admin/newCommunityView';
import { WebEditCommunityView } from '@/services/juxt-web/views/web/admin/editCommunityView';
import { WebModerateUserView } from '@/services/juxt-web/views/web/admin/moderateUserView';
import { zodCommaSeperatedList } from '@/services/juxt-web/routes/schemas';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
export const adminRouter = express.Router();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Too difficult to type
const onOffSchema = () => z.enum(['on', 'off']).default('off').transform(v => v === 'on' ? 1 : 0);
const onOffBoolSchema = onOffSchema().transform(v => !!v);

adminRouter.get('/posts', async function (req, res) {
	const { auth } = parseReq(req);

	const { data: reportPage } = await req.api.admin.reports.list({ resolved: 'false', limit: 150 });
	const userContent = auth().self.content;

	res.jsxForDirectory({
		web: <WebReportListView reasonMap={getReasonMap()} userContent={userContent} reports={reportPage.items} />
	});
});

adminRouter.get('/accounts', async function (req, res) {
	const { query } = parseReq(req, {
		query: z.object({
			page: z.coerce.number().default(0),
			search: z.string().trim().optional()
		})
	});

	const search = query.search ? query.search : undefined;
	const limit = 20;
	const offset = query.page * limit;
	const { data: usersPage } = await req.api.admin.users.list({
		search,
		limit,
		offset
	});

	const userMetrics = await getUserMetrics();
	const postMetrics = await getPostMetrics();

	res.jsxForDirectory({
		web: (
			<WebUserListView
				users={usersPage.items}
				page={query.page}
				search={search}
				userCount={usersPage.total}
				activeCount={userMetrics.currentOnlineUsers}
				dailyPostCount={postMetrics.dailyPosts}
				totalPostCount={postMetrics.totalPosts}
			/>
		)
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

	const { data: profile } = await req.api.admin.users.getProfile({ id: reqPid });
	const { data: modProfile } = await req.api.admin.users.getModProfile({ id: reqPid });
	if (!profile || !modProfile) {
		return res.redirect('/404');
	}

	const { data: reportsPage } = await req.api.admin.reports.list({ offenderPid: reqPid, limit: 50 });
	const { data: submittedReportsPage } = await req.api.admin.reports.list({ reporterPid: reqPid, limit: 50 });
	const { data: removedPostsPage } = await req.api.users.posts.list({ id: reqPid, sortBy: 'removedAt', removed: 'true', limit: 50 });

	const auditLog = await database.getLogsForTarget(reqPid, 0, 50);

	res.jsxForDirectory({
		web: (
			<WebModerateUserView
				profile={profile}
				modProfile={modProfile}
				removedPosts={removedPostsPage.items}
				reports={reportsPage.items}
				submittedReports={submittedReportsPage.items}
				auditLog={auditLog}
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
	const { params, query } = parseReq(req, {
		params: z.object({
			reportID: z.string()
		}),
		query: z.object({
			reason: z.string().trim().optional()
		})
	});

	await req.api.admin.reports.actions.removePost({ id: params.reportID, reason: query.reason });
	return res.sendStatus(200);
});

adminRouter.put('/:reportID', async function (req, res) {
	const { params, query } = parseReq(req, {
		params: z.object({
			reportID: z.string()
		}),
		query: z.object({
			reason: z.string().trim().optional()
		})
	});

	await req.api.admin.reports.actions.ignoreReport({ id: params.reportID, reason: query.reason });
	return res.sendStatus(200);
});

adminRouter.get('/communities', async function (req, res) {
	const { query } = parseReq(req, {
		query: z.object({
			page: z.coerce.number().default(0),
			search: z.string().trim().optional()
		})
	});

	const search = query.search ? query.search : undefined;
	const limit = 20;
	const offset = query.page * limit;
	const { data: communityPage } = await req.api.admin.communities.list({
		search,
		limit,
		offset
	});
	const hasNextPage = offset + communityPage.items.length < communityPage.total;

	res.jsxForDirectory({
		web: <WebManageCommunityView hasNextPage={hasNextPage} communities={communityPage.items} page={query.page} search={search} />
	});
});

adminRouter.get('/communities/new', async function (req, res) {
	if (!req.self?.permissions.developer) {
		return res.redirect('/titles/show');
	}

	res.jsxForDirectory({
		web: <WebNewCommunityView />
	});
});

adminRouter.post('/communities/new', upload.fields([{ name: 'browserIcon', maxCount: 1 }, { name: 'CTRbrowserHeader', maxCount: 1 }, { name: 'WiiUbrowserHeader', maxCount: 1 }]), async (req, res) => {
	const { body, files } = parseReq(req, {
		body: z.object({
			has_shop_page: onOffBoolSchema,
			is_recommended: onOffBoolSchema,
			platform: z.string().trim(),
			name: z.string().trim(),
			description: z.string().trim(),
			type: z.coerce.number(),
			parent: z.string().trim().nullable().transform(v => v === 'null' || v === '' ? null : v),
			title_ids: zodCommaSeperatedList,
			app_data: z.string().trim(),
			shot_mode: z.string(),
			shot_extra_title_id: zodCommaSeperatedList
		}),
		files: ['browserIcon', 'CTRbrowserHeader', 'WiiUbrowserHeader']
	});

	if (files.browserIcon.length === 0 || files.CTRbrowserHeader.length === 0 || files.WiiUbrowserHeader.length === 0) {
		return res.sendStatus(422);
	}

	const { data: outputCommunity } = await req.api.admin.communities.create({
		hasShopPage: body.has_shop_page,
		isRecommended: body.is_recommended,
		platform: body.platform as any,
		name: body.name,
		description: body.description,
		type: body.type as any,
		parent: body.parent,
		titleIds: body.title_ids,
		appData: body.app_data,
		browserIcon: files.browserIcon[0].buffer.toString('base64'),
		ctrBrowserHeader: files.CTRbrowserHeader[0].buffer.toString('base64'),
		wiiuBrowserHeader: files.WiiUbrowserHeader[0].buffer.toString('base64'),
		shotMode: body.shot_mode as any,
		shotModeExtraTitleIds: body.shot_extra_title_id
	});
	updateCommunityHashForAdminCommunity(outputCommunity);
	res.redirect(`/admin/communities/${outputCommunity.olive_community_id}`);
});

adminRouter.get('/communities/:community_id', async function (req, res) {
	const { params } = parseReq(req, {
		params: z.object({
			community_id: z.string()
		})
	});

	const { data: community } = await req.api.admin.communities.get({ id: params.community_id });
	if (!community) {
		return res.redirect('/titles/show');
	}

	res.jsxForDirectory({
		web: <WebEditCommunityView community={community} />
	});
});

adminRouter.post('/communities/:id', upload.fields([{ name: 'browserIcon', maxCount: 1 }, {
	name: 'CTRbrowserHeader',
	maxCount: 1
}, { name: 'WiiUbrowserHeader', maxCount: 1 }]), async (req, res) => {
	const { body, params, files } = parseReq(req, {
		params: z.object({
			id: z.string()
		}),
		body: z.object({
			has_shop_page: onOffBoolSchema,
			is_recommended: onOffBoolSchema,
			platform: z.string().trim(),
			name: z.string().trim(),
			description: z.string().trim(),
			type: z.coerce.number(),
			parent: z.string().trim().nullable().transform(v => v === 'null' || v === '' ? null : v),
			title_ids: zodCommaSeperatedList,
			app_data: z.string().trim(),
			shot_mode: z.string(),
			shot_extra_title_id: zodCommaSeperatedList
		}),
		files: ['browserIcon', 'CTRbrowserHeader', 'WiiUbrowserHeader']
	});

	const { data: outputCommunity } = await req.api.admin.communities.update({
		id: params.id,

		hasShopPage: body.has_shop_page,
		isRecommended: body.is_recommended,
		platform: body.platform as any,
		name: body.name,
		description: body.description,
		type: body.type as any,
		parent: body.parent,
		titleIds: body.title_ids,
		appData: body.app_data,
		browserIcon: files.browserIcon[0]?.buffer.toString('base64'),
		ctrBrowserHeader: files.CTRbrowserHeader[0]?.buffer.toString('base64'),
		wiiuBrowserHeader: files.WiiUbrowserHeader[0]?.buffer.toString('base64'),
		shotMode: body.shot_mode as any,
		shotModeExtraTitleIds: body.shot_extra_title_id
	});

	updateCommunityHashForAdminCommunity(outputCommunity);
	res.redirect(`/admin/communities/${outputCommunity.olive_community_id}`);
});

adminRouter.delete('/communities/:id', async (req, res) => {
	const { params } = parseReq(req, {
		params: z.object({
			id: z.string()
		})
	});

	await req.api.admin.communities.delete({
		id: params.id
	});
	res.json({
		error: false
	});
});

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
