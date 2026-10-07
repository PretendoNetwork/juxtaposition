import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { standardSortSchema, standardSortToDirectionPrisma } from '@/services/internal/contract/utils';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { automodRuleSchema, mapAutomodRule } from '@/services/internal/contract/admin/automodRule';
import { errors } from '@/services/internal/errors';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { automodLogSchema, mapAutomodLog } from '@/services/internal/contract/admin/automodLog';
import { automodActionInput, automodRuleModeInput, automodRuleTypeInput, convertAutomodActionInput, convertAutomodRuleModeInput, convertAutomodRuleTypeInput } from '@/models/helpers';
import type { AutomodLogWhereInput, AutomodRuleWhereInput } from '@/prisma/models';

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
	async handler({ db, query }) {
		const dbQuery: AutomodRuleWhereInput = {
			enabled: query.enabled
		};
		const rules = await db.automodRule.findMany({
			where: dbQuery,
			include: {
				keywordSettings: true
			},
			orderBy: {
				createdAt: standardSortToDirectionPrisma(query.sort)
			},
			skip: query.offset,
			take: query.limit
		});
		const total = await db.automodRule.count({
			where: dbQuery
		});

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
			type: z.enum(automodRuleTypeInput),
			mode: z.enum(automodRuleModeInput)
		}),
		response: automodRuleSchema
	},
	async handler({ body, db }) {
		const rule = await db.automodRule.create({
			data: {
				id: 'test', // TODO add ID generation
				title: body.title,
				enabled: false,
				type: convertAutomodRuleTypeInput(body.type),
				mode: convertAutomodRuleModeInput(body.mode)
			},
			include: {
				keywordSettings: true
			}
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
			type: z.enum(automodRuleTypeInput),
			mode: z.enum(automodRuleModeInput),
			settings: z.object({
				keyword: z.object({
					keywords: z.array(z.string().min(1))
				}).optional()
			})
		}).partial(),
		response: automodRuleSchema
	},
	async handler({ params, body, db }) {
		const oldRule = await db.automodRule.findUnique({
			where: {
				id: params.id
			}
		});
		if (!oldRule) {
			throw errors.for('not_found');
		}

		const desc = body.description ?? '';
		const rule = await db.automodRule.update({
			where: {
				id: oldRule.id
			},
			data: {
				title: body.title,
				description: desc.length > 0 ? desc : null,
				enabled: body.enabled,
				type: body.type ? convertAutomodRuleTypeInput(body.type) : undefined,
				mode: body.mode ? convertAutomodRuleModeInput(body.mode) : undefined
				// TODO add keyword settings update
			},
			include: {
				keywordSettings: true
			}
		});

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
	async handler({ params, db }) {
		const result = await db.automodRule.deleteMany({
			where: {
				id: params.id
			}
		});
		if (result.count === 0) {
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
			action: z.enum(automodActionInput).optional(),
			authorPid: z.coerce.number().optional(),
			sort: standardSortSchema
		}).extend(pageControlSchema(150)),
		response: pageDtoSchema(automodLogSchema)
	},
	async handler({ query, db }) {
		const dbQuery: AutomodLogWhereInput = {
			action: query.action ? convertAutomodActionInput(query.action) : undefined,
			author: query.authorPid
		};
		const logs = await db.automodLog.findMany({
			where: dbQuery,
			orderBy: {
				createdAt: standardSortToDirectionPrisma(query.sort)
			},
			skip: query.offset,
			take: query.limit
		});
		const total = await db.automodLog.count({
			where: dbQuery
		});

		const ruleIds = logs.map(v => v.ruleId);
		const rules = await db.automodRule.findMany({
			where: {
				id: {
					in: ruleIds
				}
			}
		});

		const userIds = logs.map(v => v.author).filter(v => !!v);
		const users = await db.user.findMany({
			where: {
				pid: {
					in: userIds
				}
			}
		});

		const mappedLogs = logs.map((log) => {
			const rule = rules.find(v => v.id === log.ruleId) ?? null;
			const user = users.find(v => v.pid === log.author) ?? null;

			return mapAutomodLog(log, user, rule);
		});
		return mapPage(total, mappedLogs);
	}
});
