import { defineConfig } from 'tsup';
import { copy } from 'esbuild-plugin-copy';
import { raw } from 'esbuild-raw-plugin';
import { fixImportsPlugin } from 'esbuild-fix-imports-plugin';
import browserslist from 'browserslist-to-esbuild';

export default defineConfig([
	/* Main server app (Node) */
	{
		entry: ['src/server.js'],
		sourcemap: true,
		clean: true,

		platform: 'node',
		// https://github.com/egoist/tsup/issues/1289#issuecomment-2654012955
		target: 'esnext',
		format: ['esm'],

		outDir: 'dist',

		esbuildPlugins: [
			fixImportsPlugin(),
			raw({
				ext: ['svg']
			}),
			copy({
				resolveFrom: 'cwd',
				assets: [
					{
						from: ['./src/translations/**/*.json'],
						to: ['./dist/translations']
					}
				]
			})
		]
	},
	/* CTR/3DS webfiles (Chrome 4) */
	{
		entry: [
			'src/webfiles/ctr/js/juxt.js',
			'src/webfiles/ctr/js/debug.js',
			'src/webfiles/ctr/css/juxt.css'
		],
		bundle: true,
		sourcemap: true,
		minify: true,

		outDir: 'dist/webfiles/ctr',

		platform: 'browser',
		target: 'chrome4',
		format: 'iife',

		esbuildOptions(options): void {
			options.external = ['/images/*', '/fonts/*'];
		},
		esbuildPlugins: [
			copy({
				resolveFrom: 'cwd',
				assets: [
					{
						from: ['./src/webfiles/ctr/**/*.ejs'],
						to: ['./dist/webfiles/ctr']
					},
					{
						from: ['./src/webfiles/ctr/images/**'],
						to: ['./dist/webfiles/ctr/images']
					},
					{
						from: ['./src/webfiles/ctr/fonts/**'],
						to: ['./dist/webfiles/ctr/fonts']
					}
				]
			})
		]
	},
	/* Portal/Wii U webfiles (~Chrome 20) */
	{
		entry: ['src/webfiles/portal/**/*.js', 'src/webfiles/portal/**/*.css'],
		bundle: true,
		sourcemap: true,
		minify: true,

		outDir: 'dist/webfiles/portal',

		platform: 'browser',
		target: 'chrome20',
		format: 'iife',

		esbuildOptions(options): void {
			options.external = ['/images/*', '/fonts/*'];
		},
		esbuildPlugins: [
			copy({
				resolveFrom: 'cwd',
				assets: [
					{
						from: ['./src/webfiles/portal/**/*.ejs'],
						to: ['./dist/webfiles/portal']
					},
					{
						from: ['./src/webfiles/portal/images/**'],
						to: ['./dist/webfiles/portal/images']
					},
					{
						from: ['./src/webfiles/portal/fonts/**'],
						to: ['./dist/webfiles/portal/fonts']
					}
				]
			})
		]
	},
	/* Main web frontend (Modern browsers) */
	{
		entry: ['src/webfiles/web/**/*.js', 'src/webfiles/web/**/*.css'],
		bundle: true,
		sourcemap: true,
		minify: true,

		outDir: 'dist/webfiles/web',

		platform: 'browser',
		target: browserslist(),
		format: 'iife',

		esbuildOptions(options): void {
			options.external = ['/images/*'];
		},
		esbuildPlugins: [
			copy({
				resolveFrom: 'cwd',
				assets: [
					{
						from: ['./src/webfiles/web/**/*.ejs'],
						to: ['./dist/webfiles/web']
					},
					{
						from: ['./src/webfiles/web/partials/assets/**'],
						to: ['./dist/webfiles/web/partials/assets']
					},
					{
						from: ['./src/webfiles/web/images/**'],
						to: ['./dist/webfiles/web/images']
					},
					{
						from: ['./src/webfiles/web/robots.txt'],
						to: ['./dist/webfiles/web/robots.txt']
					},
					{
						from: ['./src/webfiles/web/manifest.json'],
						to: ['./dist/webfiles/web/manifest.json']
					}
				]
			})
		]
	}
]);
