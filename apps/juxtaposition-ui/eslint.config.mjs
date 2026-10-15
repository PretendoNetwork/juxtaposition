/* eslint-disable no-restricted-imports -- Can't use paths in build config files */
import eslintConfig from '@pretendonetwork/eslint-config';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import webfilesConfig from './webfiles/base.eslint.config.mjs';

export default defineConfig([
	...eslintConfig,
	...webfilesConfig,
	{
		rules: {
			'@stylistic/jsx-one-expression-per-line': 'off'
		}
	},
	{
		// Add node.js globals to files outside of the webfiles directory
		files: ['src/**'],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.builtin
			}
		}
	},
	{
		// Ignore generated code
		ignores: ['src/api/generated']
	}
]);
