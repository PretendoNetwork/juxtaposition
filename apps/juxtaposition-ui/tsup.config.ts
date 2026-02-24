import { defineConfig } from 'tsup';
import { copy } from 'esbuild-plugin-copy';
import { raw } from 'esbuild-raw-plugin';
import { fixImportsPlugin } from 'esbuild-fix-imports-plugin';
import { oxipng } from '@repo/esbuild-plugin-oxipng';
import { spritesmith } from '@repo/esbuild-plugin-spritesmith';
import browserslist from 'browserslist-to-esbuild';

export default defineConfig([
	/* Main server app (Node) */
	{
		entry: ['src/server.ts'],
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
			'webfiles/ctr/js/juxt.js',
			'webfiles/ctr/js/debug.js',
			'webfiles/ctr/js/firstrun.js',
			'webfiles/ctr/css/juxt.css',
			'webfiles/ctr/css/firstrun.css'
		],
		bundle: true,
		sourcemap: true,
		minify: true,

		outDir: 'dist/webfiles/ctr',

		platform: 'browser',
		target: 'chrome4',
		format: 'iife',

		esbuildOptions(options): void {
			options.external = ['/fonts/*'];
			options.tsconfig = './webfiles/ctr/tsconfig.json';
		},
		esbuildPlugins: [
			oxipng({ loader: 'dataurl' }),
			spritesmith({
				input_folder: './webfiles/ctr/images/sprites/',
				output_css: './webfiles/ctr/css/sprites.css',
				output_image: './webfiles/ctr/images/sprites.png',
				output_image_url: '@/images/sprites.png'
			}),
			copy({
				resolveFrom: 'cwd',
				assets: [
					{
						from: ['./webfiles/ctr/images/**'],
						to: ['./dist/webfiles/ctr/images']
					},
					{
						from: ['./webfiles/ctr/fonts/**'],
						to: ['./dist/webfiles/ctr/fonts']
					}
				]
			})
		]
	},
	/* Portal/Wii U webfiles (~Chrome 20) */
	{
		entry: ['webfiles/portal/**/*.js', 'webfiles/portal/**/*.css'],
		bundle: true,
		sourcemap: true,
		minify: true,

		outDir: 'dist/webfiles/portal',

		platform: 'browser',
		target: 'chrome20',
		format: 'iife',

		esbuildOptions(options): void {
			options.external = ['/images/*', '/fonts/*'];
			options.tsconfig = './webfiles/portal/tsconfig.json';
		},
		esbuildPlugins: [
			copy({
				resolveFrom: 'cwd',
				assets: [
					{
						from: ['./webfiles/portal/images/**'],
						to: ['./dist/webfiles/portal/images']
					},
					{
						from: ['./webfiles/portal/fonts/**'],
						to: ['./dist/webfiles/portal/fonts']
					}
				]
			})
		]
	},
	/* Main web frontend (Modern browsers) */
	{
		entry: ['webfiles/web/**/*.js', 'webfiles/web/**/*.css'],
		bundle: true,
		sourcemap: true,
		minify: true,

		outDir: 'dist/webfiles/web',

		platform: 'browser',
		target: browserslist(),
		format: 'iife',

		esbuildOptions(options): void {
			options.external = ['/images/*'];
			options.tsconfig = './webfiles/web/tsconfig.json';
		},
		esbuildPlugins: [
			copy({
				resolveFrom: 'cwd',
				assets: [
					{
						from: ['./webfiles/web/partials/assets/**'],
						to: ['./dist/webfiles/web/partials/assets']
					},
					{
						from: ['./webfiles/web/images/**'],
						to: ['./dist/webfiles/web/images']
					},
					{
						from: ['./webfiles/web/robots.txt'],
						to: ['./dist/webfiles/web/robots.txt']
					},
					{
						from: ['./webfiles/web/manifest.json'],
						to: ['./dist/webfiles/web/manifest.json']
					}
				]
			})
		]
	}
]);
