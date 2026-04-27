import { Schema, model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

export const automodRuleType = ['keyword'] as const;
export type AutomodRuleType = (typeof automodRuleType)[number];

export const automodRuleMode = ['block', 'log'] as const;
export type AutomodRuleMode = (typeof automodRuleMode)[number];

export type AutomodKeywordSettings = {
	keywords: string[];
} & Document;

export type AutomodRule = {
	enabled: boolean;
	title: string;
	description: string | null;
	type: AutomodRuleType;
	mode: AutomodRuleMode;
	keyword_settings: {
		keywords: string[];
	};
} & Document;

export type HydratedAutomodRuleDocument = HydratedDocument<AutomodRule>;

export const automodRuleKeywordSettingsSchema = new Schema<AutomodKeywordSettings>({
	keywords: {
		type: [String],
		required: true
	}
});

export const automodRuleSchema = new Schema<AutomodRule>({
	enabled: {
		type: Boolean,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	description: String,
	type: {
		type: String,
		enum: automodRuleType,
		required: true
	},
	mode: {
		type: String,
		enum: automodRuleMode,
		required: true
	},
	keyword_settings: {
		type: automodRuleKeywordSettingsSchema,
		required: false
	}
});

export const AutomodRule = model('AutomodRule', automodRuleSchema);
