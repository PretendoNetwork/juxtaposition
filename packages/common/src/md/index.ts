import { parseJuxtMarkdownInternal } from '@/md/parser';
import { applyReplacements, retrieveReplacements } from '@/md/transform';
import { tokensToTree } from '@/md/tree';
import { extractMentionPids } from '@/md/renderer';
import type { JuxtMarkdownTransformOptions } from '@/md/transform';
import type { JuxtMdNode } from '@/md/tree';

export async function transformJuxtMarkdown(input: string, ops: JuxtMarkdownTransformOptions): Promise<string> {
	const replacements = await retrieveReplacements(input, ops);
	return applyReplacements(input, replacements);
}

export function parseJuxtMarkdown(input: string): JuxtMdNode[] {
	return tokensToTree(parseJuxtMarkdownInternal(input).tokens);
}

export function extractMentionsFromMarkdown(input: string): number[] {
	return extractMentionPids(tokensToTree(parseJuxtMarkdownInternal(input).tokens));
}
