import { z } from 'zod';
import { automodRuleMode, automodRuleType } from '@/models/automodRules';
import { asOpenapi } from '@/services/internal/builder/openapi';
import type { HydratedAutomodRuleDocument } from '@/models/automodRules';

export const automodRuleTypeEnum = asOpenapi('AutomodRuleTypeEnum', z.enum(automodRuleType));
export const automodRuleModeEnum = asOpenapi('AutomodRuleModeEnum', z.enum(automodRuleMode));

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

export function mapShallowAutomodRule(rule: HydratedAutomodRuleDocument): ShallowAutomodRuleDto {
	return {
		id: rule.id,
		type: rule.type,
		mode: rule.mode,
		title: rule.title,
		description: rule.description
	};
}

export function mapAutomodRule(rule: HydratedAutomodRuleDocument): AutomodRuleDto {
	return {
		id: rule.id,
		createdAt: rule.created_at,
		enabled: rule.enabled,
		type: rule.type,
		mode: rule.mode,
		title: rule.title,
		description: rule.description,
		settings: {
			keyword: rule.keyword_settings
				? {
						keywords: rule.keyword_settings.keywords
					}
				: null
		}
	};
}
