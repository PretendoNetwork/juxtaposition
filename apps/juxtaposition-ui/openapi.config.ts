import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	input: './test.openapi.yaml',
	output: './src/api/generated',
	plugins: [
		{
			name: '@hey-api/sdk',
			operations: {
				strategy: 'single',
				containerName: 'InternalApi'
			}
		}
	]
});
