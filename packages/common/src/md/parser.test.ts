import { parseJuxtMarkdownInternal } from '@/md/parser';

describe('parseJuxtMarkdown', () => {
	function runTest(input: string): void {
		expect(parseJuxtMarkdownInternal(input).tokens).toBeTruthy();
	}

	// These are just basic no-crash tests. Full tests are elsewhere

	it('parses normal text', () => runTest('Hello world!'));
	it('parses empty string', () => runTest(''));
	it('parses whitespace', () => runTest('     '));
	it('parses bold', () => runTest('Hello **world** and __moon__!'));
	it('parses italics', () => runTest('Hello *world* and _moon_!'));
	it('parses strikethrough', () => runTest('Hello ~~world~~'));
	it('parses newlines', () => runTest('Hello world!\nand moon!'));
	it('parses paragraphs', () => runTest('Hello world!\n\nand moon!'));

	it('parses broken markdown', () => {
		runTest('Hello *world!');
		runTest('Hello world*!');
		runTest('Hello **world!');
		runTest('Hello world**!');
		runTest('Hello __world**!');
		runTest('Hello _world*!');
		runTest('Hello `world!__');
		runTest('Hello `wor\nld!__');
		runTest('Hello ~~world!');
	});
});
