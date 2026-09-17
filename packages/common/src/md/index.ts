import { parseJuxtMarkdownInternal } from '@/md/parser';
import { applyReplacements, retrieveReplacements } from '@/md/transform';
import { tokensToTree } from '@/md/tree';
import type { JuxtMarkdownTransformOptions } from '@/md/transform';
import type { JuxtMdNode } from '@/md/tree';

export function transformJuxtMarkdown(input: string, ops: JuxtMarkdownTransformOptions): string {
	const replacements = retrieveReplacements(input, ops);
	return applyReplacements(input, replacements);
}

export function parseJuxtMarkdown(input: string): JuxtMdNode[] {
	return tokensToTree(parseJuxtMarkdownInternal(input, false));
}
