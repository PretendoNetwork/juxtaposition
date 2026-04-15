import { Logs } from '@/models/logs';
import type { LogEntryActions } from '@/models/logs';

export type CreateLogEntryOptions = {
	action: LogEntryActions;
	actorId: number;
	targetResourceId: string;
	context: string; // Description of the changes
	fields?: string[]; // What fields have been changed?
};

export async function createLogEntry(ops: CreateLogEntryOptions): Promise<void> {
	await Logs.create({
		actor: ops.actorId,
		action: ops.action,
		target: ops.targetResourceId,
		context: ops.context,
		changed_fields: ops.fields ?? []
	});
}
