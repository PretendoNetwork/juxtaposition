import MarkdownItCtor from 'markdown-it';
import { linebreakMarkdownPlugin } from '@/md/plugins/linebreak';
import type { Token } from 'markdown-it';

const markdown = new MarkdownItCtor('zero')
	.enable([
		'text',
		'emphasis',
		'strikethrough',
		'backticks',
		'newline'
	])
	.use(linebreakMarkdownPlugin);

export function parseJuxtMarkdownInternal(input: string, isPreTransform: boolean): Token[] {
	return markdown.parse(input, {
		preTransform: isPreTransform
	});
}
