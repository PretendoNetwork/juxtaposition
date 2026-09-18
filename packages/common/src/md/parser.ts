import MarkdownItCtor from 'markdown-it';
import { mentionMarkdownPlugin } from '@/md/plugins/mention';
import { linebreakMarkdownPlugin } from '@/md/plugins/linebreak';
import type { Env, Token } from 'markdown-it';

const markdown = new MarkdownItCtor('zero')
	.enable([
		'text',
		'emphasis',
		'strikethrough',
		'backticks',
		'newline'
	])
	.use(mentionMarkdownPlugin)
	.use(linebreakMarkdownPlugin);

export type ParseResult = {
	tokens: Token[];
	env: Env;
};

export function parseJuxtMarkdownInternal(input: string): ParseResult {
	const env: Env = {};
	const tokens = markdown.parse(input, env);
	return {
		tokens,
		env
	};
}
