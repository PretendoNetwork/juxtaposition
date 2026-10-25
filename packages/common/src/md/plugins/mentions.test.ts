import { parseJuxtMarkdownInternal } from '@/md/parser';
import { extractMentionDiscoveries, handleMentionDiscoveries } from '@/md/plugins/mention';
import { applyReplacements } from '@/md/transform';
import type { Token } from 'markdown-it';
import type { TransformReplacement } from '@/md/transform';
import type { MentionDiscovery } from '@/md/plugins/mention';

describe('mention discovery', () => {
	function test(input: string, expected: MentionDiscovery[]): void {
		const { env } = parseJuxtMarkdownInternal(input);
		const discoveries = extractMentionDiscoveries(env);
		expect(discoveries).toStrictEqual(expected);
	}

	it('handles normal text', () => test('Hello world!', []));
	it('handles incomplete mentions', () => test('Hello @ world!', []));
	it('doesnt invalid character mentions', () => test('Hello @[] @<> @$asd @#avbs  world!', []));

	it('discovers mentions', () => {
		test('Hello @jake_is_cool world!', [{
			start: 6,
			end: 19,
			value: '@jake_is_cool'
		}]);
		test('Hello @WITH-dashes world!', [{
			start: 6,
			end: 18,
			value: '@WITH-dashes'
		}]);
		test('Hello @cool2001 world!', [{
			start: 6,
			end: 15,
			value: '@cool2001'
		}]);
	});

	it('discovers short mentions', () => {
		test('Hello @a world!', [{
			start: 6,
			end: 8,
			value: '@a'
		}]);
	});

	it('discovers long mentions', () => {
		test('Hello @jake_is_cool_and_i_wish_to_meet_him_sometime_in_this world!', [{
			start: 6,
			end: 59,
			value: '@jake_is_cool_and_i_wish_to_meet_him_sometime_in_this'
		}]);
	});

	it('discovers chained mentions', () => {
		test('Hello @@goodbye ab@cde@@fg@ world', [
			{
				start: 7,
				end: 15,
				value: '@goodbye'
			},
			{
				start: 18,
				end: 22,
				value: '@cde'
			},
			{
				start: 23,
				end: 26,
				value: '@fg'
			}
		]);
	});

	it('handles newlines', () => {
		test('Hello\n\n@goodbye world', [
			{
				start: 7,
				end: 15,
				value: '@goodbye'
			}
		]);
	});
});

describe('handleMentionDiscoveries', () => {
	const testPnids: Record<string, number> = {
		hello: 12353,
		world: 12361236
	};
	async function pnidLookup(pnids: string[]): Promise<Array<{ pid: number } | null>> {
		return pnids.map((pnid) => {
			const val = testPnids[pnid];
			return val ? { pid: val } : null;
		});
	}

	it('handles empty input', async () => {
		expect(await handleMentionDiscoveries([], pnidLookup)).toStrictEqual([]);
	});

	it('handles inavlid pnids', async () => {
		expect(await handleMentionDiscoveries([{
			start: 42,
			end: 42,
			value: '@test'
		}], pnidLookup)).toStrictEqual([]);
	});

	it('handles valid pnids', async () => {
		expect(await handleMentionDiscoveries([{
			start: 42,
			end: 42,
			value: '@hello'
		}], pnidLookup)).toStrictEqual<TransformReplacement[]>([{
			start: 42,
			end: 42,
			value: '<@12353>'
		}]);
	});

	it('handles multiple pnids', async () => {
		const mock = vi.fn(pnidLookup);
		expect(await handleMentionDiscoveries([{
			start: 42,
			end: 42,
			value: '@hello'
		}, {
			start: 2,
			end: 2,
			value: '@fake'
		}, {
			start: 3,
			end: 3,
			value: '@world'
		}], mock)).toStrictEqual<TransformReplacement[]>([{
			start: 42,
			end: 42,
			value: '<@12353>'
		}, {
			start: 3,
			end: 3,
			value: '<@12361236>'
		}]);
		expect(mock).toHaveBeenCalledExactlyOnceWith(['hello', 'fake', 'world']);
	});
});

describe('mentionSyntaxRule', () => {
	function run(input: string): Token[] {
		const { tokens } = parseJuxtMarkdownInternal(input);
		return tokens;
	}

	it('handles normal text', () => {
		const val = run('Hello world!');
		expect(val.length).toBe(3);
		expect(val.map(v => v.type)).toStrictEqual(['paragraph_open', 'inline', 'paragraph_close']);
		const inlineTokens = val[1].children ?? [];
		expect(inlineTokens.length).toBe(1);
		expect(inlineTokens[0].type).toBe('text');
		expect(inlineTokens[0].content).toBe('Hello world!');
	});

	it('handles mention syntax', () => {
		const val = run('Hello <@1234>!');
		expect(val.length).toBe(3);
		expect(val.map(v => v.type)).toStrictEqual(['paragraph_open', 'inline', 'paragraph_close']);
		const inlineTokens = val[1].children ?? [];
		expect(inlineTokens.length).toBe(3);

		const [prefix, mention, suffix] = inlineTokens;
		expect(prefix.type).toBe('text');
		expect(prefix.content).toBe('Hello ');

		expect(mention.type).toBe('mention');
		expect(mention.content).toBe('1234');

		expect(suffix.type).toBe('text');
		expect(suffix.content).toBe('!');
	});

	it('handles broken syntax as normal text', () => {
		const val = run('Hello <@> <@23462346123512351235>!'); // Too short and too long
		expect(val.length).toBe(3);
		expect(val.map(v => v.type)).toStrictEqual(['paragraph_open', 'inline', 'paragraph_close']);
		const inlineTokens = val[1].children ?? [];
		expect(inlineTokens.length).toBe(1);
		expect(inlineTokens[0].type).toBe('text');
		expect(inlineTokens[0].content).toBe('Hello <@> <@23462346123512351235>!');
	});
});

describe('mentions integration test', () => {
	it('handles the full pipeline', async () => {
		const jamesPid = 12345;
		const input = 'Hello @james, how are you?';
		const expected = `Hello <@${jamesPid}>, how are you?`;

		async function mockPnidLookup(pnids: string[]): Promise<Array<{ pid: number } | null>> {
			return pnids.map((pnid) => {
				if (pnid === 'james') {
					return { pid: jamesPid };
				}
				return null;
			});
		}

		const { env } = parseJuxtMarkdownInternal(input);
		const discoveries = extractMentionDiscoveries(env);

		const replacements = await handleMentionDiscoveries(discoveries, mockPnidLookup);
		const output = applyReplacements(input, replacements);
		expect(output).toStrictEqual(expected);
	});
});
