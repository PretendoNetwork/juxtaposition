import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { getReasonMap } from '@/util';
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

	const { data: stats } = await req.api.admin.getStats();

	res.jsxForDirectory({
		web: (
			<WebUserListView
				users={usersPage.items}
				page={query.page}
				search={search}
				userCount={usersPage.total}
				activeCount={stats.onlineUsers}
				dailyPostCount={stats.dailyPosts}
				totalPostCount={stats.totalPosts}
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
	const { data: auditLogsPage } = await req.api.admin.auditLogs.list({
		limit: 50,
		targetId: reqPid.toString()
	});

	res.jsxForDirectory({
		web: (
			<WebModerateUserView
				profile={profile}
				modProfile={modProfile}
				removedPosts={removedPostsPage.items}
				reports={reportsPage.items}
				submittedReports={submittedReportsPage.items}
				auditLogs={auditLogsPage.items}
				reasonMap={getReasonMap()}
			/>
		)
	});
});

adminRouter.post('/accounts/:pid', async (req, res) => {
	const { params, body } = parseReq(req, {
		params: z.object({
			pid: z.coerce.number()
		}),
		body: z.object({
			// Empty string counts as null
			ban_lift_date: z.string().trim().nullable().transform(v => v === '' ? null : v)
				.pipe(z.iso.datetime().nullable()),
			account_status: z.number(),
			ban_reason: z.string().trim().nullable().transform(v => v === '' ? null : v)
		})
	});

	await req.api.admin.users.updateModProfile({
		id: params.pid,
		accountStatus: body.account_status,
		banLiftDate: body.ban_lift_date,
		banReason: body.ban_reason
	});

	res.json({
		error: false
	});
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
