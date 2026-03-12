import eslintConfig from '@pretendonetwork/eslint-config';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	...eslintConfig,
	{
		// Web specific rules
		files: ['webfiles/web/**/*.js', 'webfiles/web/**/*.ts'],
		rules: {
			'no-restricted-imports': 'off' // Compile step currently doesn't support path aliases
		},
		languageOptions: {
			globals: {
				...globals.browser,
				Pjax: false // loaded from pjax.min.js
			}
		}
	},
	{
		// Console specific rules
		files: [
			'webfiles/ctr/**/*.js',
			'webfiles/ctr/**/*.ts',
			'webfiles/portal/**/*.js',
			'webfiles/portal/**/*.ts'
		],
		rules: {
			'no-restricted-imports': 'off', // Compile step currently doesn't support path aliases
			'no-var': 'off', // Consoles need to use var
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
			globals: {
				...globals.browser,
				wiiuBrowser: 'readonly',
				wiiuSound: 'readonly',
				wiiuMainApplication: 'readonly',
				wiiuErrorViewer: 'readonly',
				wiiuMemo: 'readonly',
				wiiuDialog: 'readonly',
				wiiu: 'readonly',
				cave: 'readonly',
				Olv: 'readonly',
				Pjax: false // loaded from pjax.min.js
			}
		}
	},
	{
		// NodeJS globals
		languageOptions: {
			globals: {
				...globals.node,
				...globals.builtin
			}
		},
		ignores: ['src/**']
	},

	// Set typescript projects correctly
	{
		files: [
			'webfiles/ctr/**'
		],
		settings: {
			'import/resolver': {
				typescript: {
					project: 'webfiles/ctr/tsconfig.json'
				}
			}
		}
	},
	{
		files: [
			'webfiles/portal/**'
		],
		settings: {
			'import/resolver': {
				typescript: {
					project: 'webfiles/portal/tsconfig.json'
				}
			}
		}
	},
	{
		files: [
			'webfiles/web/**'
		],
		settings: {
			'import/resolver': {
				typescript: {
					project: 'webfiles/web/tsconfig.json'
				}
			}
		}
	}
]);
