import eslintConfig from '@pretendonetwork/eslint-config';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	...eslintConfig,
	{
		rules: {
			'no-restricted-imports': 'off', // Path aliases aren't resolved
			'no-var': 'off',
			'no-restricted-syntax': [
				'error',
				{
					selector: 'VariableDeclaration[kind=\'let\']',
					message: 'Consoles do not support let. Use var.'
				},
				{
					selector: 'VariableDeclaration[kind=\'const\']',
					message: 'Consoles do not support const. Use var.'
				},
				{
					selector: 'ObjectPattern',
					message: 'Consoles do not support Object destructuring.'
				},
				{
					selector: 'ArrayPattern',
					message: 'Consoles do not support Array destructuring.'
				},
				{
					selector: 'Property[method=true]',
					message: 'Consoles do not support Object method shorthand.'
				}
			]
		},
		languageOptions: {
			globals: globals.browser
		}
	}
]);
