import eslintConfig from '@pretendonetwork/eslint-config';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	...eslintConfig,
	{
		rules: {
			'@stylistic/jsx-one-expression-per-line': 'off'
		}
	},
	{
		// Allow browser globals in webfiles
		languageOptions: {
			globals: {
				...globals.browser,
				Pjax: false // loaded from pjax.min.js
			}
		},
		rules: {
			'no-restricted-imports': 'off' // It's a special compile step, we can't use path aliases
		},
		files: ['webfiles/**/*.js', 'webfiles/**/*.ts']
	},
	{
		// Rules that apply to the 3DS (CTR) and Wii U (Portal) browsers
		files: [
			'webfiles/ctr/**/*.js',
			'webfiles/ctr/**/*.ts',
			'webfiles/portal/**/*.js',
			'webfiles/portal/**/*.ts',
			'webfiles/common/**/*.js',
			'webfiles/common/**/*.ts'
		],
		rules: {
			'no-var': 'off' // 3DS and Wii U browsers need to use var
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
				Olv: 'readonly'
			}
		}
	},
	{
		// Add node.js globals to files outside of the webfiles directory
		languageOptions: {
			globals: {
				...globals.node,
				...globals.builtin
			}
		},
		ignores: ['webfiles/**/*.js', 'webfiles/**/*.ts']
	},
	{
		// Ignore generated code
		ignores: ['src/api/generated']
	},
	{
		// Set tsconfig for Portal (wiiu) webfiles
		settings: {
			'import/resolver': {
				typescript: {
					project: './webfiles/portal/tsconfig.json'
				}
			}
		},
		files: [
			'webfiles/portal/**/*.js',
			'webfiles/portal/**/*.ts'
		]
	},
	{
		// Set tsconfig for ctr (3ds) webfiles
		settings: {
			'import/resolver': {
				typescript: {
					project: './webfiles/ctr/tsconfig.json'
				}
			}
		},
		files: [
			'webfiles/ctr/**/*.js',
			'webfiles/ctr/**/*.ts'
		]
	},
	{
		// Set tsconfig for web (browser) webfiles
		settings: {
			'import/resolver': {
				typescript: {
					project: './webfiles/web/tsconfig.json'
				}
			}
		},
		files: [
			'webfiles/web/**/*.js',
			'webfiles/web/**/*.ts'
		]
	},
	{
		// Set tsconfig for library (common) webfiles
		settings: {
			'import/resolver': {
				typescript: {
					project: './webfiles/common/tsconfig.json'
				}
			}
		},
		files: [
			'webfiles/common/**/*.js',
			'webfiles/common/**/*.ts'
		]
	}
]);
