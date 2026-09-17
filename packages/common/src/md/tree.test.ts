import { tokensToTree } from '@/md/tree';
import type { Token } from 'markdown-it';
import type { JuxtMdNode } from '@/md/tree';

function token(type: string, content?: string): Token {
	return {
		type,
		content
	} as Token;
}

function paragraph(inline: Token[]): Token[] {
	const inlineToken = token('inline');
	inlineToken.children = inline;
	return [
		token('paragraph_open'),
		inlineToken,
		token('paragraph_close')
	];
}

describe('tokensToTree / block', () => {
	it('handles empty tokens', () => {
		expect(tokensToTree([])).toStrictEqual([]);
	});

	it('handles paragraphs', () => {
		expect(tokensToTree([
			token('paragraph_open'),
			token('inline'),
			token('paragraph_close')
		])).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: []
		}]);
	});

	it('handles paragraphs with text', () => {
		expect(tokensToTree([
			...paragraph([
				token('text', 'Hello world!')
			])
		])).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: [{
				type: 'text',
				value: 'Hello world!'
			}]
		}]);
	});

	it('throws on incomplete paragraphs', () => {
		expect(() => tokensToTree([
			token('paragraph_open'),
			token('inline')
		])).toThrow();
		expect(() => tokensToTree([
			token('paragraph_open'),
			token('paragraph_close')
		])).toThrow();
		expect(() => tokensToTree([
			token('paragraph_close')
		])).toThrow();
	});

	it('throws on unknown block tokens', () => {
		expect(() => tokensToTree([token('invalid_token')])).toThrow();
		expect(() => tokensToTree([token('inline')])).toThrow();
		expect(() => tokensToTree([token('paragraph_close')])).toThrow();
	});
});

describe('tokensToTree / inline', () => {
	it('handles text', () => {
		expect(tokensToTree(paragraph([
			token('text', 'Hello'),
			token('text', 'World')
		]))).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: [{
				type: 'text',
				value: 'Hello'
			}, {
				type: 'text',
				value: 'World'
			}]
		}]);
	});

	it('handles newlines', () => {
		expect(tokensToTree(paragraph([
			token('text', 'Hello'),
			token('softbreak'),
			token('text', 'World')
		]))).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: [{
				type: 'text',
				value: 'Hello'
			}, {
				type: 'br'
			},
			{
				type: 'text',
				value: 'World'
			}]
		}]);
	});

	it('handles newlines', () => {
		expect(tokensToTree(paragraph([
			token('text', 'Hello'),
			token('softbreak'),
			token('text', 'World')
		]))).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: [{
				type: 'text',
				value: 'Hello'
			}, {
				type: 'br'
			},
			{
				type: 'text',
				value: 'World'
			}]
		}]);
	});

	it('handles bold', () => {
		expect(tokensToTree(paragraph([
			token('strong_open'),
			token('text', 'Hello'),
			token('strong_close')
		]))).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: [{
				type: 'bold',
				children: [{
					type: 'text',
					value: 'Hello'
				}]
			}]
		}]);
	});

	it('handles italic', () => {
		expect(tokensToTree(paragraph([
			token('em_open'),
			token('text', 'Hello'),
			token('em_close')
		]))).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: [{
				type: 'italic',
				children: [{
					type: 'text',
					value: 'Hello'
				}]
			}]
		}]);
	});

	it('handles strikethrough', () => {
		expect(tokensToTree(paragraph([
			token('s_open'),
			token('text', 'Hello'),
			token('s_close')
		]))).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: [{
				type: 'strikethrough',
				children: [{
					type: 'text',
					value: 'Hello'
				}]
			}]
		}]);
	});

	it('handles inline code', () => {
		expect(tokensToTree(paragraph([
			token('code_inline', 'this is code')
		]))).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: [{
				type: 'code',
				value: 'this is code'
			}]
		}]);
	});

	it('handles mentions', () => {
		expect(tokensToTree(paragraph([
			token('mention', '1234')
		]))).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: [{
				type: 'mention',
				pid: 1234
			}]
		}]);
	});

	it('handles nested container nodes', () => {
		expect(tokensToTree(paragraph([
			token('strong_open'),
			token('em_open'),
			token('text', 'Hello'),
			token('em_close'),
			token('text', 'World'),
			token('strong_close')
		]))).toStrictEqual<JuxtMdNode[]>([{
			type: 'paragraph',
			children: [{
				type: 'bold',
				children: [{
					type: 'italic',
					children: [{
						type: 'text',
						value: 'Hello'
					}]
				}, {
					type: 'text',
					value: 'World'
				}]
			}]
		}]);
	});

	it('throws on unknown inline tokens', () => {
		expect(() => tokensToTree(paragraph([
			token('invalid_token')
		]))).toThrow();
	});
});
