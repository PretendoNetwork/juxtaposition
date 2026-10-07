import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import { automodRuleModeInput, automodRuleTypeInput, mapAutomodRuleMode, mapAutomodRuleType } from '@/models/helpers';
import type { AutomodRule, AutomodRuleKeywordSetting } from '@/prisma/client';

export const automodRuleTypeEnum = asOpenapi('AutomodRuleTypeEnum', z.enum(automodRuleTypeInput));
export const automodRuleModeEnum = asOpenapi('AutomodRuleModeEnum', z.enum(automodRuleModeInput));

export const automodRuleSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	enabled: z.boolean(),
	type: automodRuleTypeEnum,
	mode: automodRuleModeEnum,
	title: z.string(),
	description: z.string().nullable(),
	settings: z.object({
		keyword: z.object({
			keywords: z.array(z.string())
		}).nullable()
	})
}).openapi('AutomodRule');

export type AutomodRuleDto = z.infer<typeof automodRuleSchema>;

export const shallowAutomodRuleSchema = asOpenapi('ShallowAutomodRule', z.object({
	id: z.string(),
	type: automodRuleTypeEnum,
	mode: automodRuleModeEnum,
	title: z.string(),
	description: z.string().nullable()
}));

export type ShallowAutomodRuleDto = z.infer<typeof shallowAutomodRuleSchema>;

export function mapShallowAutomodRule(rule: AutomodRule): ShallowAutomodRuleDto {
	return {
		id: rule.id,
		type: mapAutomodRuleType(rule.type),
		mode: mapAutomodRuleMode(rule.mode),
		title: rule.title,
		description: rule.description
	};
}

export function mapAutomodRule(rule: AutomodRule & { keywordSettings: AutomodRuleKeywordSetting | null }): AutomodRuleDto {
	return {
		id: rule.id,
		createdAt: rule.createdAt,
		enabled: rule.enabled,
		type: mapAutomodRuleType(rule.type),
		mode: mapAutomodRuleMode(rule.mode),
		title: rule.title,
		description: rule.description,
		settings: {
			keyword: rule.keywordSettings
				? {
						keywords: rule.keywordSettings.keywords
					}
				: null
		}
	};
}
