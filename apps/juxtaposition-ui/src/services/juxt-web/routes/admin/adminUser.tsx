import express from 'express';
import { z } from 'zod';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { ModerateUserRemovedPostView } from '@/services/juxt-web/views/web/admin/moderate-user/moderateUserPostView';
import { WebModerateUserView } from '@/services/juxt-web/views/web/admin/moderate-user/moderateUserView';
import { ModerateUserOverviewView } from '@/services/juxt-web/views/web/admin/moderate-user/moderateUserOverviewView';
import { ModerateUserReportsListView } from '@/services/juxt-web/views/web/admin/moderate-user/moderateUserReportsView';
import { getReasonMap } from '@/util';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';

export const adminUserRouter = express.Router();

adminUserRouter.get('/accounts/:pid', async function (req, res) {
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

	const { data: auditLogsPage } = await req.api.admin.auditLogs.list({
		limit: 50,
		targetId: reqPid.toString()
	});

	res.jsxForDirectory({
		web: (
			<WebModerateUserView profile={profile} tab="overview">
				<ModerateUserOverviewView
					modProfile={modProfile}
					auditLogs={auditLogsPage.items}
				/>
			</WebModerateUserView>
		)
	});
});

adminUserRouter.get('/accounts/:pid/removed', async function (req, res) {
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
	if (!profile) {
		return res.redirect('/404');
	}
	const { data: removedPostsPage } = await req.api.users.posts.list({ id: reqPid, sortBy: 'removedAt', removed: 'true', limit: 50 });

	res.jsxForDirectory({
		web: (
			<WebModerateUserView profile={profile} tab="removed">
				<ModerateUserRemovedPostView
					removedPosts={removedPostsPage.items}
				/>
			</WebModerateUserView>
		)
	});
});

adminUserRouter.get('/accounts/:pid/reports', async function (req, res) {
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
	if (!profile) {
		return res.redirect('/404');
	}

	const { data: reportsPage } = await req.api.admin.reports.list({ offenderPid: reqPid, limit: 50 });
	const { data: submittedReportsPage } = await req.api.admin.reports.list({ reporterPid: reqPid, limit: 50 });

	res.jsxForDirectory({
		web: (
			<WebModerateUserView profile={profile} tab="reports">
				<ModerateUserReportsListView
					reports={reportsPage.items}
					submittedReports={submittedReportsPage.items}
					reasonMap={getReasonMap()}
				/>
			</WebModerateUserView>
		)
	});
});

adminUserRouter.get('/accounts/:pid/posts', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const { params, query, auth } = parseReq(req, {
		params: z.object({
			pid: z.coerce.number()
		}),
		query: z.object({
			pjax: z.stringbool().default(false),
			offset: z.coerce.number().default(0)
		})
	});

	const reqPid = params.pid;
	const { data: profile } = await req.api.admin.users.getProfile({ id: reqPid });
	if (!profile) {
		return res.redirect('/404');
	}

	const { data: postPage } = await req.api.users.posts.list({ id: reqPid, offset: query.offset });
	const postListProps: PostListViewProps = {
		nextLink: `/admin/accounts/${reqPid}/posts?offset=${postPage.items.length + query.offset}&pjax=true`,
		posts: postPage.items,
		userContent: auth().self?.content ?? null
	};

	if (query.pjax) {
		return res.jsxForDirectory({
			web: (
				<WebPostListView {...postListProps} />
			)
		});
	}

	res.jsxForDirectory({
		web: (
			<WebModerateUserView profile={profile} tab="posts">
				<WebPostListView {...postListProps} />
			</WebModerateUserView>
		)
	});
});

adminUserRouter.post('/accounts/:pid', async (req, res) => {
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
