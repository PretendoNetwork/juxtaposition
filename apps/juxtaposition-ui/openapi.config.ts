import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	input: './test.openapi.yaml',
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
