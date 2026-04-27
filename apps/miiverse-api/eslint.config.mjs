import eslintConfig from '@pretendonetwork/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	...eslintConfig,
	{
		rules: {
			// Zod has too complex types to make a return type
			'@typescript-eslint/explicit-function-return-type': 'off'
		}
	}
]);
