import { parseJuxtMarkdown } from '@/md';
import { renderToPlainText } from '@/md/renderer';

function runTest(input: string, output: string): void {
	expect(renderToPlainText(parseJuxtMarkdown(input))).toStrictEqual(output);
}

describe('renderToPlainText', () => {
	it('handles empty nodes', () => {
		expect(renderToPlainText([])).toStrictEqual('');
		runTest('', '');
	});

	it('handles normal text', () => {
		runTest('Hello world!', 'Hello world!');
	});

	it('handles bold text', () => {
		runTest('Hello **world**!', 'Hello world!');
	});

	it('handles italic text', () => {
		runTest('Hello *world*!', 'Hello world!');
	});

	it('handles strikethrough text', () => {
		runTest('Hello ~~world~~!', 'Hello world!');
	});

	it('handles incomplete markdown', () => {
		runTest('Hello **world!', 'Hello **world!');
	});

	it('handles inline code', () => {
		runTest('Hello `world`!', 'Hello world!');
	});

	it('handles newlines', () => {
		runTest('Hello\nworld!', 'Hello\nworld!');
	});

	it('handles paragraphs', () => {
		runTest('Hello\n\nworld!', 'Hello\n\nworld!');
	});

	it('handles mixed newlines and paragraphs', () => {
		const input = `
Hello
World!

This is very cool...

Very..

Cool
.
		`.trim();
		runTest(input, input);
	});
});
