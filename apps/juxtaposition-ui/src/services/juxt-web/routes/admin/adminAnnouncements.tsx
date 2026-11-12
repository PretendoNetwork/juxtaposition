import express from 'express';
import { z } from 'zod';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebAnnouncementCreateView } from '@/services/juxt-web/views/web/admin/announcementCreateView';
import { WebAnnouncementListView } from '@/services/juxt-web/views/web/admin/announcementListView';

export const adminAnnouncementRouter = express.Router();

adminAnnouncementRouter.get('/announcements', async function (req, res) {
	const { query } = parseReq(req, {
		query: z.object({
			page: z.coerce.number().default(0)
		})
	});

	const limit = 30;
	const offset = query.page * limit;
	const { data: announcementsPage } = await req.api.admin.announcements.list({
		limit,
		offset
	});

	res.jsxForDirectory({
		web: (
			<WebAnnouncementListView
				announcements={announcementsPage.items}
				page={query.page}
			/>
		)
	});
});

adminAnnouncementRouter.get('/announcements/create', async function (req, res) {
	if (!res.locals.developer) {
		return res.redirect('/titles/show');
	}

	return res.jsxForDirectory({
		web: <WebAnnouncementCreateView />
	});
});

adminAnnouncementRouter.post('/announcements/create', async function (req, res) {
	const { body } = parseReq(req, {
		body: z.object({
			text: z.string().min(1)
		})
	});

	await req.api.admin.announcements.create({
		text: body.text
	});

	res.redirect('/admin/announcements');
});

adminAnnouncementRouter.post('/announcements/delete', async function (req, res) {
	const { body } = parseReq(req, {
		body: z.object({
			id: z.string().min(1)
		})
	});

	await req.api.admin.announcements.delete({
		id: body.id
	});

	res.redirect('/admin/announcements');
});
