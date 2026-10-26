import type { Env, MarkdownIt, StateCore, StateInline } from 'markdown-it';
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
	sourceOffset?: number;
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

	const env = state.env as MentionDiscoveryEnv;
	const inlineStartPos = env.sourceOffset;
	if (inlineStartPos === undefined) {
		return false; // Unknown location of the mention, can't build a proper discovery
	}

	const mentionString = match[0];
	env.mentionDiscoveries ??= [];
	env.mentionDiscoveries.push({
		start: inlineStartPos + pos,
		end: inlineStartPos + pos + mentionString.length,
		value: mentionString
	});

	return false; // False because we don't actually want to handle it as a new token
}

// The standard inline plugin, but with source offset tracking
// original: https://github.com/markdown-it/markdown-it/blob/master/src/rules_core/inline.ts
function inlineOffsetTrackingCoreRule(state: StateCore): void {
	const env = state.env as MentionDiscoveryEnv;
	const lineOffsets = [0]; // Map of newline index -> original source index

	for (let i = 0; i < state.src.length; i++) {
		if (state.src[i] === '\n') {
			lineOffsets.push(i + 1);
		}
	}

	const tokens = state.tokens;

	// Parse inlines
	for (let i = 0, l = tokens.length; i < l; i++) {
		const tok = tokens[i];
		if (tok.type === 'inline') {
			const lineStart = lineOffsets[tok.map?.[0] ?? 0] ?? 0;
			const contentStart = state.src.indexOf(tok.content, lineStart); // Whitespace is trimmed from inline blocks
			env.sourceOffset = contentStart === -1 ? undefined : contentStart;

			state.md.inline.parse(tok.content, state.md, state.env, tok.children!);
		}
	}
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

export async function handleMentionDiscoveries(discoveries: MentionDiscovery[], pnidSearcher: (pnids: string[]) => Promise<Array<{ pid: number } | null>>): Promise<TransformReplacement[]> {
	const replacements: TransformReplacement[] = [];

	const parsedDiscoveries: Array<{ discovery: MentionDiscovery; pnid: string }> = [];
	for (const discovery of discoveries) {
		const match = discovery.value.match(MENTION_REGEX);
		if (!match) {
			continue;
		}
		parsedDiscoveries.push({
			discovery,
			pnid: match[1]
		});
	}

	const pnids = parsedDiscoveries.length > 0 ? await pnidSearcher(parsedDiscoveries.map(v => v.pnid)) : [];
	for (let i = 0; i < parsedDiscoveries.length; i++) {
		const { discovery } = parsedDiscoveries[i];
		const pnid = pnids[i];
		if (!pnid || !discovery) {
			continue;
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
	md.core.ruler.at('inline', inlineOffsetTrackingCoreRule);
	md.inline.ruler.push('mention-discovery', mentionDiscoveryRule);
	md.inline.ruler.push('mention-syntax', mentionSyntaxRule);
}
