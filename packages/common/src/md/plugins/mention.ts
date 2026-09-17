import type { Env, MarkdownIt, StateInline } from 'markdown-it';
import type { TransformReplacement } from '@/md/transform';

const MENTION_REGEX = /^@([\w.-]{1,})/;
const MENTION_SYNTAX_REGEX = /^<@(\d{1,16})>/;

export type MentionDiscovery = {
	start: number;
	end: number;
	value: string;
};

export type MentionDiscoveryEnv = Env & {
	mentionDiscoveries?: MentionDiscovery[];
};

// Discovers all mentions (like: `@pnid`) in markdown and emits their locations
export function mentionDiscoveryRule(state: StateInline, _silent: boolean): boolean {
	const pos = state.pos;
	const max = state.posMax;

	if (state.src.charCodeAt(pos) !== 0x40/* @ */) {
		return false; // Not a mention, lacking @
	}

	if (pos + 1 >= max) {
		return false; // Need at least 1 character after the @ before matching
	}

	const match = state.src.slice(pos).match(MENTION_REGEX);
	if (!match) {
		return false; // Does not match regex for a mention
	}

	const mentionString = match[0];
	const env = state.env as MentionDiscoveryEnv;
	env.mentionDiscoveries ??= [];
	env.mentionDiscoveries.push({
		start: pos,
		end: pos + mentionString.length + 1,
		value: mentionString
	});

	return false; // False because we don't actually want to handle it as a new token
}

export function extractMentionDiscoveries(env: Env): MentionDiscovery[] {
	return (env as MentionDiscoveryEnv)?.mentionDiscoveries ?? [];
}

// Turns all mention syntax (like: `<@12345678>`) into mention tokens
export function mentionSyntaxRule(state: StateInline, silent: boolean): boolean {
	const pos = state.pos;
	const max = state.posMax;

	if (state.src.charCodeAt(pos) !== 0x3C/* < */) {
		return false; // Not the mention syntax, lacking <
	}

	if (pos + 1 >= max) {
		return false; // Need at least 1 character after the < before matching
	}

	const match = state.src.slice(pos).match(MENTION_SYNTAX_REGEX);
	if (!match) {
		return false; // Does not match regex for the mention syntax
	}

	const pid = match[1];
	if (!silent) {
		const token = state.push('mention', '', 0);
		token.content = pid;
	}
	state.pos += match[0].length;
	return true;
}

export async function handleMentionDiscoveries(discoveries: MentionDiscovery[], pnidSearcher: (pnid: string) => Promise<{ pid: number } | null>): Promise<TransformReplacement[]> {
	const replacements: TransformReplacement[] = [];

	for (const discovery of discoveries) {
		const match = discovery.value.match(MENTION_REGEX);
		if (!match) {
			continue;
		}

		const pnid = await pnidSearcher(match[1]);
		if (!pnid) {
			continue; // Not a valid PNID, don't handle
		}

		replacements.push({
			start: discovery.start,
			end: discovery.end,
			value: `<@${pnid.pid}>` // Turn into the mention syntax
		});
	}

	return replacements;
}

export function mentionMarkdownPlugin(md: MarkdownIt): void {
	md.inline.ruler.push('mention-discovery', mentionDiscoveryRule);
	md.inline.ruler.push('mention-syntax', mentionSyntaxRule);
}
