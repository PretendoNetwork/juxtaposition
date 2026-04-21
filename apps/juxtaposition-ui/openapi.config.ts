import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	input: '../miiverse-api/internal.openapi.json',
	output: './src/api/generated',
	plugins: [
		{
			name: '@hey-api/client-fetch',
			throwOnError: true
		},
		{
			name: '@hey-api/sdk',
			paramsStructure: 'flat',
			operations: {
				strategy: 'single',
				containerName: 'InternalApi',
				nesting: 'operationId'
			}
		}
	]
});
