import eslintConfig from '@pretendonetwork/eslint-config';

export default [
	...eslintConfig,
	{
		ignores: [
			'src/webfiles' // during refactor of juxt, let's ignore the web files
		]
	}
];
