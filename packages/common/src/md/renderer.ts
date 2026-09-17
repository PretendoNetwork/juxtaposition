import type { JuxtMdInlineNode, JuxtMdNode } from '@/md/tree';

export type RenderPlainTextUser = {
	pid: number;
	username: string;
};

export function renderInlineToPlainText(nodes: JuxtMdInlineNode[], userList: RenderPlainTextUser[]): string {
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

		if (node.type === 'mention') {
			const user = userList.find(v => v.pid === node.pid);
			runs.push(`@${user?.username ?? node.pid}`);
			continue;
		}

		if (node.type === 'code') {
			runs.push(node.value);
			continue;
		}

		if (node.type === 'bold' || node.type === 'italic' || node.type === 'strikethrough') {
			runs.push(...renderInlineToPlainText(node.children, userList));
			continue;
		}

		throw new Error(`Unknown node: ${node.type}`);
	}

	return runs.join('');
}

export function renderToPlainText(tree: JuxtMdNode[], userList: RenderPlainTextUser[] = []): string {
	const blocks: string[] = [];

	for (const node of tree) {
		if (node.type === 'paragraph') {
			blocks.push(renderInlineToPlainText(node.children, userList));
			continue;
		}

		throw new Error(`Unknown node: ${node.type}`);
	}

	return blocks.join('\n\n');
}

function extractMentionPidsInline(tree: JuxtMdInlineNode[]): number[] {
	const output: number[] = [];

	for (const node of tree) {
		if (node.type === 'mention') {
			output.push(node.pid);
		}
		if (node.type === 'bold' || node.type === 'italic' || node.type === 'strikethrough') {
			output.push(...extractMentionPidsInline(node.children));
		}
	}

	return output;
}

export function extractMentionPids(tree: JuxtMdNode[]): number[] {
	const output: number[] = [];

	for (const node of tree) {
		if (node.type === 'paragraph') {
			output.push(...extractMentionPidsInline(node.children));
		}
	}

	return output;
}
