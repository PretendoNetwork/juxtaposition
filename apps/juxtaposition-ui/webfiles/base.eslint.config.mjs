import globals from 'globals';

export default [
	{
		// Web rules
		files: ['webfiles/web/**/*.js', 'webfiles/web/**/*.ts'],
		languageOptions: {
			globals: {
				...globals.browser,
				Pjax: false // loaded from pjax.min.js
			}
		}
	},
	{
		// Console rules
		files: [
			'webfiles/ctr/**/*.{js,ts}',
			'webfiles/portal/**/*.{js,ts}',
			'webfiles/common/**/*.{js,ts}' // Common is used by consoles, so needs the same rules
		],
		rules: {
			'no-var': 'off', // 3DS and Wii U browsers need to use var
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
		// Ignore polyfilles
		ignores: [
			'webfiles/ctr/js/polyfills',
			'webfiles/portal/js/polyfills'
		]
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
	},
	{
		files: [
			'webfiles/common/**'
		],
		settings: {
			'import/resolver': {
				typescript: {
					project: 'webfiles/common/tsconfig.json'
				}
			}
		}
	}
];
