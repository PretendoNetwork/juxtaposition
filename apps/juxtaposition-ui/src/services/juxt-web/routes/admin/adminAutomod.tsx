import express from 'express';
import { z } from 'zod';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebAutomodLogListView } from '@/services/juxt-web/views/web/admin/automodLogListView';
import { automodRuleMode, automodRuleType } from '@/models/automodRules';
import { WebAutomodRuleListView } from '@/services/juxt-web/views/web/admin/automodRuleListView';
import { WebAutomodRuleCreateView } from '@/services/juxt-web/views/web/admin/automodRuleCreateView';
import { onOffSchema } from '@/services/juxt-web/routes/admin/admin';
import type { AutomodRuleListViewProps } from '@/services/juxt-web/views/web/admin/automodRuleListView';
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

	const limit = 100;
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

adminAutomodRouter.get('/automod/rules', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	const { query } = parseReq(req, {
		query: z.object({
			page: z.coerce.number().default(0)
		})
	});

	const limit = 50;
	const offset = query.page * limit;
	const { data: rulePage } = await req.api.admin.automodRules.list({
		offset,
		limit
	});
	const hasNextPage = offset + limit < rulePage.total;

	const props: AutomodRuleListViewProps = {
		items: rulePage.items,
		total: rulePage.total,
		page: query.page,
		hasNextPage
	};

	return res.jsxForDirectory({
		web: <WebAutomodRuleListView {...props} />
	});
});

adminAutomodRouter.get('/automod/rules/create', async function (req, res) {
	if (!res.locals.moderator) {
		return res.redirect('/titles/show');
	}

	return res.jsxForDirectory({
		web: <WebAutomodRuleCreateView />
	});
});

adminAutomodRouter.post('/automod/rules/create', async function (req, res) {
	const { body } = parseReq(req, {
		body: z.object({
			title: z.string().min(1),
			type: z.enum(automodRuleType),
			mode: z.enum(automodRuleMode)
		})
	});

	await req.api.admin.automodRules.create({
		mode: body.mode,
		type: body.type,
		title: body.title
	});

	res.redirect('/admin/automod/rules');
});

adminAutomodRouter.post('/automod/rules/:id/update', async function (req, res) {
	const { body, params } = parseReq(req, {
		params: z.object({
			id: z.string()
		}),
		body: z.object({
			title: z.string().min(1),
			description: z.string(),
			type: z.enum(automodRuleType),
			mode: z.enum(automodRuleMode),
			enabled: onOffSchema(),
			keywordSettingsKeywords: z.string().default('')
		})
	});

	const keywords = body.keywordSettingsKeywords.split('\n').map(v => v.trim()).filter(v => v.length > 0);

	await req.api.admin.automodRules.update({
		id: params.id,
		mode: body.mode,
		type: body.type,
		title: body.title,
		description: body.description,
		enabled: !!body.enabled,
		settings: {
			keyword: body.type === 'keyword'
				? {
						keywords: keywords
					}
				: undefined
		}
	});

	res.redirect('/admin/automod/rules');
});

adminAutomodRouter.post('/automod/rules/:id/delete', async function (req, res) {
	const { params } = parseReq(req, {
		params: z.object({
			id: z.string()
		})
	});

	await req.api.admin.automodRules.delete({
		id: params.id
	});

	res.redirect('/admin/automod/rules');
});
