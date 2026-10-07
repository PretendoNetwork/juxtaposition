import type { JuxtMdInlineNode, JuxtMdNode } from '@/md/tree';

export function renderInlineToPlainText(nodes: JuxtMdInlineNode[]): string {
	const runs: string[] = [];

	for (const node of nodes) {
		if (node.type === 'text') {
			runs.push(node.value);
			continue;
		}

		if (node.type === 'br') {
			runs.push('\n');
			continue;
		}

		if (node.type === 'code') {
			runs.push(node.value);
			continue;
		}

		if (node.type === 'bold' || node.type === 'italic' || node.type === 'strikethrough') {
			runs.push(...renderInlineToPlainText(node.children));
			continue;
		}

		throw new Error(`Unknown node: ${node.type}`);
	}

	return runs.join('');
}

export function renderToPlainText(tree: JuxtMdNode[]): string {
	const blocks: string[] = [];

	for (const node of tree) {
		if (node.type === 'paragraph') {
			blocks.push(renderInlineToPlainText(node.children));
			continue;
		}

		throw new Error(`Unknown node: ${node.type}`);
	}

	return blocks.join('\n\n');
}
