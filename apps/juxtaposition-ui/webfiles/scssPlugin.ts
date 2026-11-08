import { fixImportsPlugin } from 'esbuild-fix-imports-plugin';
import { sassPlugin } from 'esbuild-sass-plugin';
import browserslist from 'browserslist-to-esbuild';
import { oxipng } from '@repo/esbuild-plugin-oxipng';
import { spritesmith } from '@repo/esbuild-plugin-spritesmith';
import { copy } from 'esbuild-plugin-copy';
import type { Options } from 'tsup';

const themes = [
	'base',
	'pink'
];

type BuildEntriesOptions = {
	name: string;
	outDir: string;
	themes: string[];
	options: Omit<Options, 'name' | 'outDir'>;
};

function makeThemedBuildEntries(ops: BuildEntriesOptions): Options[] {
	return ops.themes.map(theme => ({
		...ops.options,
		name: `${ops.name}-${theme}`,
		outDir: `${ops.outDir}/themes/${theme}`,
		esbuildPlugins: [
			fixImportsPlugin(),
			sassPlugin({
				type: 'css',

				precompile(source, _pathname, isRoot) {
					if (!isRoot) {
						return source;
					}

					return `@use '../themes/${theme}';\n\n${source}`;
				}
			}),
			...(ops.options.esbuildPlugins ?? [])
		]
	}));
}

export const scssBuildEntries: Options[] = [
	...makeThemedBuildEntries({
		name: 'web-css',
		themes,
		outDir: 'dist/webfiles/web/css',
		options: {
			entry: [
				'webfiles/web/css/entrypoints/web.scss',
				'webfiles/web/css/entrypoints/admin.scss',
				'webfiles/web/css/entrypoints/first_run.scss',
				'webfiles/web/css/entrypoints/login.scss'
			],
			bundle: true,
			minify: true,

			platform: 'browser',
			target: browserslist(),

			external: ['/images/*'],
			tsconfig: './webfiles/web/tsconfig.json', // Used for import aliases
			esbuildPlugins: [
				fixImportsPlugin()
			]
		}
	}),
	...makeThemedBuildEntries({
		name: 'portal-css',
		themes,
		outDir: 'dist/webfiles/portal/css',
		options: {
			entry: [
				'webfiles/portal/css/entrypoints/juxt.scss',
				'webfiles/portal/css/entrypoints/firstrun.scss'
			],
			bundle: true,
			minify: true,

			platform: 'browser',
			target: 'chrome20',

			loader: {
				'.inline.svg': 'dataurl'
			},
			external: ['/images/*', '/fonts/*'],
			tsconfig: './webfiles/portal/tsconfig.json', // Used for import aliases
			esbuildPlugins: [
				fixImportsPlugin(),
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
		}
	}),
	...makeThemedBuildEntries({
		name: 'ctr-css',
		themes,
		outDir: 'dist/webfiles/ctr/css',
		options: {
			entry: [
				'webfiles/ctr/css/entrypoints/juxt.scss',
				'webfiles/ctr/css/entrypoints/firstrun.scss'
			],
			bundle: true,
			minify: true,

			platform: 'browser',
			target: 'chrome4',

			external: ['/fonts/*'],
			tsconfig: './webfiles/ctr/tsconfig.json', // Used for import aliases
			esbuildPlugins: [
				fixImportsPlugin(),
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
		}
	})
];
