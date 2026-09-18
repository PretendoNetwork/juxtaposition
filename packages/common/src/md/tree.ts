import type { Token } from 'markdown-it';

export type JuxtMdNode =
	{ type: 'paragraph'; children: JuxtMdInlineNode[] };

type JuxtMdInlineContainerNode = 'bold' | 'italic' | 'strikethrough';
export type JuxtMdInlineNode =
	{ type: 'text'; value: string } |
	{ type: 'br' } |
	{ type: JuxtMdInlineContainerNode; children: JuxtMdInlineNode[] } |
	{ type: 'code'; value: string };

const containerOpenTokens = ['strong_open', 'em_open', 's_open'];
const containerCloseTokens: Record<string, JuxtMdInlineContainerNode | undefined> = {
	strong_close: 'bold',
	em_close: 'italic',
	s_close: 'strikethrough'
};

function inlineTokensToTree(inlineTokens: Token[]): JuxtMdInlineNode[] {
	const root: JuxtMdInlineNode[] = [];
	const stack: JuxtMdInlineNode[][] = [root];

	for (const token of inlineTokens) {
		if (token.type === 'text') {
			stack[0]?.push({
				type: 'text',
				value: token.content
			});
			continue;
		}

		if (token.type === 'softbreak' || token.type === 'hardbreak') {
			stack[0]?.push({
				type: 'br'
			});
			continue;
		}

		if (containerOpenTokens.includes(token.type)) {
			stack.unshift([]);
			continue;
		}
		const closeToken = containerCloseTokens[token.type];
		if (closeToken) {
			const children = stack.shift() ?? [];
			stack[0].push({
				type: closeToken,
				children
			});
			continue;
		}

		if (token.type === 'code_inline') {
			stack[0]?.push({
				type: 'code',
				value: token.content
			});
			continue;
		}

		throw new Error(`Unrecognized markdown-it token: ${token.type} - this shouldn't be possible`);
	}

	return root;
}

export function tokensToTree(tokens: Token[]): JuxtMdNode[] {
	const output: JuxtMdNode[] = [];

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];

		if (token.type === 'paragraph_open') {
			i++;
			const inline = tokens[i];
			if (inline?.type !== 'inline') {
				throw new Error(`Expected inline, got ${inline?.type}`);
			}

			i++;
			const close = tokens[i];
			if (close?.type !== 'paragraph_close') {
				throw new Error(`Expected paragraph_close, got ${close?.type}`);
			}

			output.push({
				type: 'paragraph',
				children: inlineTokensToTree(inline.children ?? [])
			});
			continue;
		}

		throw new Error(`Unrecognized markdown-it token: ${token.type} - this shouldn't be possible`);
	}

	return output;
}
