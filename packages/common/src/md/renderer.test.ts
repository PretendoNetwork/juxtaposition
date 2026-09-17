import { renderToPlainText } from '@/md/renderer';

describe('renderToPlainText', () => {
	it('handles empty nodes', () => {
		expect(renderToPlainText([])).toStrictEqual('');
	});

	// TODO add more tests
});
