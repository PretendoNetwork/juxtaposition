import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import { logEntryActions } from '@/models/helpers';
import type { LogEntryActions } from '@/models/helpers';
import type { AuditLogEntry, User } from '@/prisma/client';

export const auditLogActionSchema = asOpenapi('AuditLogAction', z.enum(logEntryActions));

export const auditLogSchema = z.object({
	id: z.string(),
	actor: shallowUserSchema,
	targetId: z.string(),
	action: auditLogActionSchema,
	actionAt: z.date(),
	context: z.string(),
	changedFields: z.array(z.string())
}).openapi('AuditLog');

export type AuditLogDto = z.infer<typeof auditLogSchema>;

export function mapAuditLog(log: AuditLogEntry, actorUser: User): AuditLogDto {
	return {
		id: log.id,
		actor: mapShallowUser(actorUser),
		targetId: log.targetResourceId,
		action: log.actionType as LogEntryActions,
		actionAt: log.createdAt,
		context: log.context,
		changedFields: log.changedFields
	};
}
