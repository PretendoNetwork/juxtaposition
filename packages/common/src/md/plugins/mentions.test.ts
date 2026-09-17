import { parseJuxtMarkdownInternal } from '@/md/parser';
import { extractMentionDiscoveries, handleMentionDiscoveries } from '@/md/plugins/mention';
import type { Token } from 'markdown-it';
import type { MentionDiscovery } from '@/md/plugins/mention';

describe('mention discovery', () => {
	function test(input: string, expected: MentionDiscovery[]): void {
		const { env } = parseJuxtMarkdownInternal(input);
		const discoveries = extractMentionDiscoveries(env);
		expect(discoveries).toStrictEqual(expected);
	}

	it('handles normal text', () => test('Hello world!', []));
	it('handles incomplete mentions', () => test('Hello @ world!', []));
	it('doesnt discover too short mentions', () => test('Hello @abc world!', []));
	it('doesnt discover too long mentions', () => test('Hello @thisistoolongtobeamention world!', []));
	it('doesnt invalid character mentions', () => test('Hello @[] @<> @$asd @#avbs  world!', []));

	it('discovers mentions', () => {
		test('Hello @jake_is_cool world!', [{
			start: 6,
			end: 20,
			value: '@jake_is_cool'
		}]);
		test('Hello @WITH-dashes world!', [{
			start: 6,
			end: 19,
			value: '@WITH-dashes'
		}]);
		test('Hello @cool2001 world!', [{
			start: 6,
			end: 16,
			value: '@cool2001'
		}]);
	});
});

describe('handleMentionDiscoveries', () => {
	const testPnids: Record<string, number> = {
		hello: 12353,
		world: 12361236
	};
	async function pnidLookup(pnid: string): Promise<{ pid: number } | null> {
		const val = testPnids[pnid];
		return val ? { pid: val } : null;
	}

	it('handles empty input', () => {
		expect(handleMentionDiscoveries([], pnidLookup)).toStrictEqual([]);
	});

	// TODO add more tests
});

describe('mentionSyntaxRule', () => {
	function run(input: string): Token[] {
		const { tokens } = parseJuxtMarkdownInternal(input);
		return tokens;
	}

	it('handles normal text', () => {
		const val = run('Hello world!');
		expect(val).toBeTruthy(); // TODO make real test
	});
	// TODO add more tests
});
