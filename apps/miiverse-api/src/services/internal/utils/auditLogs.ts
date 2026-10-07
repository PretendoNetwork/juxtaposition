import { randomUUID } from 'crypto';
import type { PrismaClient } from '@/prisma/client';
import type { LogEntryActions } from '@/models/helpers';

export const accountActionDisplayMap: Record<number, LogEntryActions> = {
	0: 'UNBAN',
	1: 'LIMIT_POSTING',
	2: 'TEMP_BAN',
	3: 'PERMA_BAN'
};

export type CreateLogEntryOptions = {
	action: LogEntryActions;
	actorId: number;
	targetResourceId: string;
	context: string; // Description of the changes
	fields?: string[]; // What fields have been changed?
};

export async function createLogEntry(db: PrismaClient, ops: CreateLogEntryOptions): Promise<void> {
	await db.auditLogEntry.create({
		data: {
			id: randomUUID(),
			actor: ops.actorId,
			actionType: ops.action,
			targetResourceId: ops.targetResourceId,
			context: ops.context,
			changedFields: ops.fields ?? []
		}
	});
}
