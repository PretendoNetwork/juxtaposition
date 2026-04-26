import { Schema, model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

export const automodAction = ['blocked', 'logged'] as const;
export type AutomodAction = (typeof automodAction)[number];

export type AutomodLog = {
	rule_id: string;
	created_at: Date;
	author: number;
	action: AutomodAction;
	post_id: string | null;
	post_content_body: string | null;
} & Document;

export type HydratedAutomodLogDocument = HydratedDocument<AutomodLog>;

export const automodLogSchema = new Schema<AutomodLog>({
	rule_id: {
		type: String,
		required: true
	},
	created_at: {
		type: Date,
		required: true
	},
	action: {
		type: String,
		enum: automodAction,
		required: true
	},
	author: {
		type: Number,
		required: true
	},
	post_id: {
		type: String,
		required: false
	},
	post_content_body: {
		type: String,
		required: false
	}
});

export const AutomodLog = model('AutomodLog', automodLogSchema);
