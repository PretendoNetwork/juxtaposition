import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { standardSortSchema, standardSortToDirection } from '@/services/internal/contract/utils';
import { auditLogActionSchema, auditLogSchema, mapAuditLog } from '@/services/internal/contract/admin/auditLogs';
import { Logs } from '@/models/logs';
import { deleteOptional } from '@/services/internal/utils';
import type { FilterQuery } from 'mongoose';
import type { AuditLog } from '@/models/logs';

export const adminAuditLogs = createInternalApiRouter();

adminAuditLogs.get({
	path: '/admin/audit-logs',
	name: 'admin.auditLogs.list',
	guard: guards.moderator,
	schema: {
		query: z.object({
			targetId: z.string().optional(),
			action: auditLogActionSchema.optional(),
			sort: standardSortSchema
		}).extend(pageControlSchema()),
		response: pageDtoSchema(auditLogSchema)
	},
	async handler({ query, db }) {
		const dbQuery: FilterQuery<AuditLog> = deleteOptional({
			target: query.targetId,
			action: query.action
		});
		const logs = await Logs
			.find(dbQuery)
			.sort({ timestamp: standardSortToDirection(query.sort) })
			.limit(query.limit)
			.skip(query.offset);
		const total = await Logs.countDocuments(dbQuery);

		const users = await db.user.findMany({
			where: {
				pid: {
					in: logs.map(v => v.actor)
				}
			}
		});

		return mapPage(total, logs.map(v => mapAuditLog(v, users.find(u => u.pid === v.actor)!)));
	}
});
