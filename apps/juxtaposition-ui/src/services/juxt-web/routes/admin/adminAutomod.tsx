import express from 'express';
import { z } from 'zod';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebAutomodLogListView } from '@/services/juxt-web/views/web/admin/automodLogListView';
import type { AutomodLogListViewProps } from '@/services/juxt-web/views/web/admin/automodLogListView';

export const adminAutomodRouter = express.Router();

adminAutomodRouter.get('/automod', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const { query } = parseReq(req, {
		query: z.object({
			action: z.enum(['blocked', 'logged']).optional(),
			page: z.coerce.number().default(0)
		})
	});

	const limit = 50;
	const offset = query.page * limit;
	const { data: logPage } = await req.api.admin.automodLogs.list({
		action: query.action,
		offset,
		limit
	});
	const hasNextPage = offset + limit < logPage.total;

	const props: AutomodLogListViewProps = {
		items: logPage.items,
		total: logPage.total,
		page: query.page,
		hasNextPage
	};

	return res.jsxForDirectory({
		web: <WebAutomodLogListView {...props} />
	});
});
