/* eslint-disable no-restricted-imports -- It doesn't support paths in build scripts */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { defineConfig } from 'tsup';
import { copy } from 'esbuild-plugin-copy';
import { raw } from 'esbuild-raw-plugin';
import { fixImportsPlugin } from 'esbuild-fix-imports-plugin';
import browserslist from 'browserslist-to-esbuild';
import { scssBuildEntries } from './webfiles/scssPlugin';

export default defineConfig([
	/* Main server app (Node) */
	{
		name: 'server',
		entry: ['src/server.ts'],
		sourcemap: true,
		clean: true,

		platform: 'node',
		// https://github.com/egoist/tsup/issues/1289#issuecomment-2654012955
		target: 'esnext',
		format: ['esm'],

		outDir: 'dist',

		plugins: [{
			name: 'openapi',
			async buildStart(): Promise<void> {
				if (!existsSync('../miiverse-api/internal.openapi.json')) {
					this.logger.warn('openapi', 'Could not find miiverse-api openAPI schema. Please compile miiverse-api before compiling juxtaposition-ui');
					this.logger.warn('openapi', 'Skipping openAPI client compilation, this will cause issues');
					return;
				}
				execSync('openapi-ts -f ./openapi.config.ts');
				this.logger.info('openapi', 'Generated API client for miiverse-api');
			}
		}],
		esbuildPlugins: [
			fixImportsPlugin(),
			raw({
				ext: ['svg']
			}),
			copy({
				resolveFrom: 'cwd',
				assets: [
					{
						from: ['./src/assets/**/*.json'],
						to: ['./dist/assets']
					},
					{
						from: ['./webfiles/global/*'],
						to: ['./dist/webfiles/global']
					}
				]
			})
		]
	},
	/* CTR/3DS webfiles (Chrome 4) */
	{
		name: 'ctr-js',
		entry: [
			'webfiles/ctr/js/juxt.js',
			'webfiles/ctr/js/debug.js',
			'webfiles/ctr/js/firstrun.js'
		],
		bundle: true,
		sourcemap: true,
		minify: true,

		outDir: 'dist/webfiles/ctr/js',

		platform: 'browser',
		target: 'chrome4',
		format: 'iife',

		tsconfig: './webfiles/ctr/tsconfig.json'
	},
	/* Portal/Wii U webfiles (~Chrome 20) */
	{
		name: 'wup-js',
		entry: [
			'webfiles/portal/js/juxt.js',
			'webfiles/portal/js/debug.js',
			'webfiles/portal/js/firstrun.js'
		],
		bundle: true,
		sourcemap: true,
		minify: true,

		outDir: 'dist/webfiles/portal/js',

		platform: 'browser',
		target: 'chrome20',
		format: 'iife',

		tsconfig: './webfiles/portal/tsconfig.json',
		esbuildPlugins: [
			fixImportsPlugin()
		]
	},
	/* Main web frontend (Modern browsers) */
	{
		name: 'web-js',
		entry: [
			'webfiles/web/js/admin.ts',
			'webfiles/web/js/login.js',
			'webfiles/web/js/painting.js',
			'webfiles/web/js/web.js'
		],
		bundle: true,
		sourcemap: true,
		minify: true,

		outDir: 'dist/webfiles/web/js',

		platform: 'browser',
		target: browserslist(),
		format: 'iife',

		tsconfig: './webfiles/web/tsconfig.json',
		esbuildPlugins: [
			fixImportsPlugin(),
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
	},

	/* SCSS configurations */
	...scssBuildEntries
]);
