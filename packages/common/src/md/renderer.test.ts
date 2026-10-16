import { parseJuxtMarkdown } from '@/md';
import { extractMentionPids, renderToPlainText } from '@/md/renderer';

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

	it('handles invalid mentions', () => {
		runTest('Hello <@1234>!', 'Hello @1234!');
	});

	it('handles valid mentions', () => {
		expect(renderToPlainText(parseJuxtMarkdown('Hello <@1234>!'), [{
			pid: 1234,
			username: 'jake'
		}])).toStrictEqual('Hello @jake!');
	});

	it('handles paragraphs', () => {
		runTest('Hello\n\nworld!', 'Hello\n\nworld!');
	});

	it('preserves all newlines', () => {
		runTest('Hello\n\nworld!', 'Hello\n\nworld!');
		runTest('Hello\n\n\nworld!', 'Hello\n\n\nworld!');
		runTest('Hello\n\n\n\n\nworld!', 'Hello\n\n\n\n\nworld!');
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

describe('extractMentionPids', () => {
	it('extracts all mentions from all formatting', () => {
		const tokens = parseJuxtMarkdown(`
			Hello world!

			Today is the day that <@1234> will be crowned King.
			Not to mention that **_<@5432>_** will get married to ~~<@7125>~~ as well!

			That was all,
			- **<@1629>**
		`);
		expect(extractMentionPids(tokens)).toStrictEqual([1234, 5432, 7125, 1629]);
	});
});
