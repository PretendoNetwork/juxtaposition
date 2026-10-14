import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { standardSortSchema, standardSortToDirectionPrisma } from '@/services/internal/contract/utils';
import { auditLogActionSchema, auditLogSchema, mapAuditLog } from '@/services/internal/contract/admin/auditLogs';
import type { AuditLogEntryWhereInput } from '@/prisma/models';

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
		const dbQuery: AuditLogEntryWhereInput = {
			targetResourceId: query.targetId,
			actionType: query.action
		};
		const logs = await db.auditLogEntry.findMany({
			where: dbQuery,
			orderBy: {
				createdAt: standardSortToDirectionPrisma(query.sort)
			},
			take: query.limit,
			skip: query.offset
		});
		const total = await db.auditLogEntry.count({
			where: dbQuery
		});

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
