import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/server.js'],
	splitting: false,
	sourcemap: true,
	platform: 'node',
	clean: true,
	format: ['cjs']
});
