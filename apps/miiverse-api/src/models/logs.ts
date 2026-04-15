import { Schema, model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

export const logEntryActions = [
	'REMOVE_POST',
	'IGNORE_REPORT',
	'LIMIT_POSTING',
	'TEMP_BAN',
	'PERMA_BAN',
	'UNBAN',
	'UPDATE_USER',
	'MAKE_COMMUNITY',
	'UPDATE_COMMUNITY',
	'DELETE_COMMUNITY'
] as const;
export type LogEntryActions = (typeof logEntryActions)[number];

export type AuditLog = {
	actor: number;
	action: LogEntryActions;
	target: string;
	context: string;
	timestamp: Date;
	changed_fields: string[];
} & Document;

export type HydratedEndpointDocument = HydratedDocument<AuditLog>;

export const auditLogSchema = new Schema<AuditLog>({
	actor: {
		type: Number,
		required: true
	},
	action: {
		type: String,
		enum: logEntryActions,
		required: true
	},
	target: {
		type: String,
		required: true
	},
	context: {
		type: String,
		required: true
	},
	timestamp: {
		type: Date,
		default: Date.now,
		required: true
	},
	changed_fields: {
		type: [String],
		default: [],
		required: true
	}
});

export const Logs = model('Log', auditLogSchema);
