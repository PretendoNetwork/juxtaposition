import type { AutomodActionType, AutomodRuleMode, AutomodRuleType, ServerAccessLevel } from '@/prisma/enums';

export const automodRuleTypeInput = ['keyword'] as const;
export type AutomodRuleTypeInput = (typeof automodRuleTypeInput)[number];

export const automodRuleModeInput = ['block', 'log'] as const;
export type AutomodRuleModeInput = (typeof automodRuleModeInput)[number];

export const automodActionInput = ['blocked', 'logged'] as const;
export type AutomodActionInput = (typeof automodActionInput)[number];

const automodRuleTypeInputMap: Record<AutomodRuleTypeInput, AutomodRuleType> = {
	keyword: 'Keyword'
};
export function convertAutomodRuleTypeInput(input: AutomodRuleTypeInput): AutomodRuleType {
	return automodRuleTypeInputMap[input];
}

const automodRuleModeInputMap: Record<AutomodRuleModeInput, AutomodRuleMode> = {
	block: 'Block',
	log: 'Log'
};
export function convertAutomodRuleModeInput(input: AutomodRuleModeInput): AutomodRuleMode {
	return automodRuleModeInputMap[input];
}

const automodActionInputMap: Record<AutomodActionInput, AutomodActionType> = {
	blocked: 'Blocked',
	logged: 'Logged'
};
export function convertAutomodActionInput(input: AutomodActionInput): AutomodActionType {
	return automodActionInputMap[input];
}

const automodRuleTypeMap: Record<AutomodRuleType, AutomodRuleTypeInput> = {
	Keyword: 'keyword'
};
export function mapAutomodRuleType(action: AutomodRuleType) {
	return automodRuleTypeMap[action];
}

const automodRuleModeMap: Record<AutomodRuleMode, AutomodRuleModeInput> = {
	Block: 'block',
	Log: 'log'
};
export function mapAutomodRuleMode(action: AutomodRuleMode) {
	return automodRuleModeMap[action];
}

const automodActionTypeMap: Record<AutomodActionType, AutomodActionInput> = {
	Blocked: 'blocked',
	Logged: 'logged'
};
export function mapAutomodAction(action: AutomodActionType) {
	return automodActionTypeMap[action];
}

const serverAccessLevelMap: Record<string, ServerAccessLevel | undefined> = {
	prod: 'Prod',
	test: 'Beta',
	dev: 'Dev'
};
export function convertAccountServerAccessLevel(input: string): ServerAccessLevel | null {
	return serverAccessLevelMap[input] ?? null;
}

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

export type AutomodLogMatch = {
	start: number;
	end: number;
};

export type AutomodLogMatchList = AutomodLogMatch[];
