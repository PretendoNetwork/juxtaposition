import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	sourcemap: true,
	platform: 'node',
	clean: true,
	format: ['esm'],
	target: 'esnext',
	dts: true
});
