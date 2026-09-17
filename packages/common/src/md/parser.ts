import MarkdownItCtor from 'markdown-it';
import type { Token } from 'markdown-it';

const markdown = new MarkdownItCtor('zero')
	.enable([
		'text',
		'emphasis',
		'strikethrough',
		'backticks',
		'newline'
	]);

export function parseJuxtMarkdownInternal(input: string, isPreTransform: boolean): Token[] {
	return markdown.parse(input, {
		preTransform: isPreTransform
	});
}
