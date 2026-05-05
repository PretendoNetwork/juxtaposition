import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { deleteOptional } from '@/services/internal/utils';
import { standardSortSchema, standardSortToDirection } from '@/services/internal/contract/utils';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { automodRuleSchema, mapAutomodRule } from '@/services/internal/contract/admin/automodRule';
import { AutomodRule, automodRuleMode, automodRuleType } from '@/models/automodRules';
import { errors } from '@/services/internal/errors';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { automodLogSchema, mapAutomodLog } from '@/services/internal/contract/admin/automodLog';
import { automodAction, AutomodLog } from '@/models/automodLog';
import { Settings } from '@/models/settings';
import type { RootFilterQuery } from 'mongoose';

export const adminAutomodRouter = createInternalApiRouter();

adminAutomodRouter.get({
	path: '/admin/automod-rules',
	name: 'admin.automodRules.list',
	guard: guards.moderator,
	schema: {
		query: z.object({
			enabled: z.stringbool().optional(),
			sort: standardSortSchema
		}).extend(pageControlSchema(50)),
		response: pageDtoSchema(automodRuleSchema)
	},
	async handler({ query }) {
		const dbQuery: RootFilterQuery<AutomodRule> = deleteOptional({
			enabled: query.enabled
		});
		const rules = await AutomodRule
			.find(dbQuery)
			.sort({ created_at: standardSortToDirection(query.sort) })
			.skip(query.offset)
			.limit(query.limit);
		const total = await AutomodRule.countDocuments(dbQuery);

		return mapPage(total, rules.map(v => mapAutomodRule(v)));
	}
});

adminAutomodRouter.post({
	path: '/admin/automod-rules',
	name: 'admin.automodRules.create',
	description: 'Create a initial start of a rule, use the update endpoint for the rest of the fields',
	guard: guards.developer,
	schema: {
		body: z.object({
			title: z.string(),
			type: z.enum(automodRuleType),
			mode: z.enum(automodRuleMode)
		}),
		response: automodRuleSchema
	},
	async handler({ body }) {
		const rule = await AutomodRule.create({
			title: body.title,
			enabled: false,
			created_at: new Date(),
			type: body.type,
			mode: body.mode
		});

		return mapAutomodRule(rule);
	}
});

adminAutomodRouter.patch({
	path: '/admin/automod-rules/:id',
	name: 'admin.automodRules.update',
	guard: guards.developer,
	schema: {
		params: z.object({
			id: z.string()
		}),
		body: z.object({
			title: z.string().trim().min(1),
			description: z.string().trim().nullable(),
			enabled: z.boolean(),
			type: z.enum(automodRuleType),
			mode: z.enum(automodRuleMode),
			settings: z.object({
				keyword: z.object({
					keywords: z.array(z.string().min(1))
				}).optional()
			})
		}).partial(),
		response: automodRuleSchema
	},
	async handler({ params, body }) {
		const desc = body.description ?? '';
		const rule = await AutomodRule.findOneAndUpdate({ _id: params.id }, {
			$set: deleteOptional({
				title: body.title,
				description: desc.length > 0 ? desc : null,
				enabled: body.enabled,
				type: body.type,
				mode: body.mode,
				keyword_settings: body.settings?.keyword
					? {
							keywords: body.settings.keyword.keywords
						}
					: undefined
			})
		}, { new: true });

		if (!rule) {
			throw errors.for('not_found');
		}

		return mapAutomodRule(rule);
	}
});

adminAutomodRouter.delete({
	path: '/admin/automod-rules/:id',
	name: 'admin.automodRules.delete',
	guard: guards.developer,
	schema: {
		params: z.object({
			id: z.string()
		}),
		response: resultSchema
	},
	async handler({ params }) {
		const rule = await AutomodRule.findOneAndDelete({ _id: params.id });
		if (!rule) {
			throw errors.for('not_found');
		}

		return mapResult('success');
	}
});

adminAutomodRouter.get({
	path: '/admin/automod-logs',
	name: 'admin.automodLogs.list',
	guard: guards.moderator,
	schema: {
		query: z.object({
			action: z.enum(automodAction).optional(),
			authorPid: z.coerce.number().optional(),
			sort: standardSortSchema
		}).extend(pageControlSchema(150)),
		response: pageDtoSchema(automodLogSchema)
	},
	async handler({ query }) {
		const dbQuery: RootFilterQuery<AutomodLog> = deleteOptional({
			action: query.action,
			author: query.authorPid
		});
		const logs = await AutomodLog
			.find(dbQuery)
			.sort({ created_at: standardSortToDirection(query.sort) })
			.skip(query.offset)
			.limit(query.limit);
		const total = await AutomodLog.countDocuments(dbQuery);

		const ruleIds = logs.map(v => v.rule_id);
		const rules = await AutomodRule.find({
			_id: {
				$in: ruleIds
			}
		});

		const userIds = logs.map(v => v.author);
		const users = await Settings.find({
			_id: {
				$in: userIds
			}
		});

		const mappedLogs = logs.map((log) => {
			const rule = rules.find(v => v.id === log.rule_id) ?? null;
			const user = users.find(v => v.pid === log.author) ?? null;

			return mapAutomodLog(log, user, rule);
		});
		return mapPage(total, mappedLogs);
	}
});
