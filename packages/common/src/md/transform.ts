import { parseJuxtMarkdownInternal } from '@/md/parser';

export type JuxtMarkdownTransformOptions = {
	// Currently nothing
};

export type TransformReplacement = {
	start: number; // index of first character to be replaced
	end: number; // index of the last character, not included in the replacement
	value: string;
};

export function retrieveReplacements(input: string, _ops: JuxtMarkdownTransformOptions): TransformReplacement[] {
	parseJuxtMarkdownInternal(input, true); // TODO process replacements
	return [];
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
