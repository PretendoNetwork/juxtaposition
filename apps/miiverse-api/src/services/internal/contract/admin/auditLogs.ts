import { z } from 'zod';
import { logEntryActions } from '@/models/logs';
import { asOpenapi } from '@/services/internal/builder/openapi';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import type { HydratedAuditLogDocument } from '@/models/logs';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

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

export function mapAuditLog(log: HydratedAuditLogDocument, actorSettings: HydratedSettingsDocument): AuditLogDto {
	return {
		id: log.id,
		actor: mapShallowUser(actorSettings),
		targetId: log.target,
		action: log.action,
		actionAt: log.timestamp,
		context: log.context,
		changedFields: log.changed_fields
	};
}
