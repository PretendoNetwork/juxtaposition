import type { MarkdownIt, StateCore } from 'markdown-it';

// Taken from https://github.com/markdown-it/markdown-it/issues/211#issuecomment-3518888176
// Logic slightly changed to it doesn't add a newline for every paragraph
function preserveLinebreakRule(state: StateCore): void {
	const tokens = state.tokens;

	for (let i = 0; i < tokens.length; i++) {
		const nextOpen = tokens[i];

		if (nextOpen?.type !== 'paragraph_open') {
			continue;
		}

		// pattern we want just before `nextOpen` :
		// [paragraph_open, inline, paragraph_close]
		const prevClose = tokens[i - 1];
		const prevInline = tokens[i - 2];
		const prevOpen = tokens[i - 3];

		if (
			!prevClose || !prevInline || !prevOpen ||
			prevClose.type !== 'paragraph_close' ||
			prevInline.type !== 'inline' ||
			prevOpen.type !== 'paragraph_open'
		) {
			// previous block wasn't a paragraph, skip
			continue;
		}

		// Both open tokens usually have `map: [startLine, endLineExclusive]`
		// The gap between them is the number of empty lines in between
		const prevMap = prevOpen.map;
		const nextMap = nextOpen.map;

		if (!prevMap || !nextMap) {
			continue;
		}

		// 0 => no blank line, 1 => one blank, ...
		const emptyLines = nextMap[0] - prevMap[1];

		if (emptyLines <= 0) {
			continue;
		}

		// Rule : 2 lines are accounted for by the paragraph, the rest is newlines
		const brCount = Math.max(0, emptyLines - 1);

		const children = prevInline.children || (prevInline.children = []);

		for (let k = 0; k < brCount; k++) {
			const br = new state.Token('hardbreak', 'br', 0);
			children.push(br);
		}
	}
}

export function linebreakMarkdownPlugin(md: MarkdownIt): void {
	md.core.ruler.after('inline', 'preserve-linebreak', preserveLinebreakRule);
}
