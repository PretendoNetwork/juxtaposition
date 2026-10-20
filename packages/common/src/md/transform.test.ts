import { applyReplacements, retrieveReplacements } from '@/md/transform';

describe('retrieveReplacements', () => {
	it('does nothing with no special syntax', async () => {
		expect(await retrieveReplacements('Hello world!', {})).toStrictEqual([]);
	});
});

describe('applyReplacements', () => {
	it('handles one replacement', () => {
		expect(applyReplacements('abcdefg', [
			{
				start: 1,
				end: 5,
				value: '__'
			}
		])).toStrictEqual('a__fg');
	});

	it('handles max and min replacements', () => {
		expect(applyReplacements('abcdefg', [
			{
				start: 0,
				end: 1,
				value: '__'
			}
		])).toStrictEqual('__bcdefg');
		expect(applyReplacements('abcdefg', [
			{
				start: 6,
				end: 7,
				value: '__'
			}
		])).toStrictEqual('abcdef__');
	});

	it('handles multiple replacements', () => {
		expect(applyReplacements('abcdefg', [
			{
				start: 1,
				end: 4,
				value: '__'
			},
			{
				start: 4,
				end: 6,
				value: '-'
			}
		])).toStrictEqual('a__-g');
	});
});
