import eslintConfig from '@pretendonetwork/eslint-config';
import globals from 'globals';

export default [
	...eslintConfig,
	{
		// Allow browser globals in webfiles
		languageOptions: {
			globals: {
				...globals.browser,
				Pjax: false // loaded from pjax.min.js
			}
		},
		files: ['src/webfiles/**/*.js']
	},
	{
		// Rules that apply to the 3DS (CTR) and Wii U (Portal) browsers
		files: ['src/webfiles/ctr/**/*.js', 'src/webfiles/portal/**/*.js'],
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
		ignores: ['src/webfiles/**/*.js']
	}
];
