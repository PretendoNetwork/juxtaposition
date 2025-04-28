import { defineConfig } from 'tsup';
import { copy } from 'esbuild-plugin-copy';

export default defineConfig({
	entry: ['src/**/*.{js,ts}', '!src/webfiles/**/*.js'],
	splitting: false,
	sourcemap: true,
	platform: 'node',
	clean: true,
	bundle: false,
	format: ['cjs'],
	esbuildPlugins: [
		copy({
			resolveFrom: 'cwd',
			assets: [
				{
					from: ['./src/webfiles/**/*'],
					to: ['./dist/webfiles']
				},
				{
					from: ['./src/translations/**/*.json'],
					to: ['./dist/translations']
				}
			]
		})
	]
});
