export const automodRuleType = ['keyword'] as const;
export type AutomodRuleType = (typeof automodRuleType)[number];

export const automodRuleMode = ['block', 'log'] as const;
export type AutomodRuleMode = (typeof automodRuleMode)[number];
