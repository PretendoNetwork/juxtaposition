import { parseJuxtMarkdownInternal } from '@/md/parser';
import { extractMentionDiscoveries, handleMentionDiscoveries } from '@/md/plugins/mention';

export type JuxtMarkdownTransformOptions = {
	lookupPnid?: (pnid: string) => Promise<{ pid: number } | null>;
};

export type TransformReplacement = {
	start: number; // index of first character to be replaced
	end: number; // index of the last character, not included in the replacement
	value: string;
};

export async function retrieveReplacements(input: string, ops: JuxtMarkdownTransformOptions): Promise<TransformReplacement[]> {
	const replacements: TransformReplacement[] = [];
	const { env } = parseJuxtMarkdownInternal(input);

	if (ops.lookupPnid) {
		const discoveries = extractMentionDiscoveries(env);
		const mentionReplacements = await handleMentionDiscoveries(discoveries, ops.lookupPnid);
		replacements.push(...mentionReplacements);
	}

	return replacements;
}

export function applyReplacements(input: string, replacements: TransformReplacement[]): string {
	// Applying replacements backwards means we don't have to deal with moving start indexes
	const backwardsReplacements = [...replacements]
		.sort((a, b) => a.start - b.start)
		.reverse();

	let output = input;
	for (const replacement of backwardsReplacements) {
		// This cannot handle overlapping replacements. So uh, don't input those.
		output = output.slice(0, replacement.start) + replacement.value + output.slice(replacement.end);
	}

	return output;
}
