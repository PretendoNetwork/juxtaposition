import { Loader, OnLoadArgs, OnLoadResult, OnStartResult, Plugin, PluginBuild } from 'esbuild';
import { readFile } from 'node:fs/promises';
// This is really what they recommend doing https://github.com/jamsinclair/jSquash/blob/main/examples/with-node/index.js
import { default as optimiseOxi, init as initOxi } from '@jsquash/oxipng/optimise.js';
import { basename } from 'node:path';
import { OptimiseOptions } from '@jsquash/oxipng/meta';

const NAMESPACE = 'esbuild-plugin-oxipng';
const FILTER = /.png$/;

export type Options = {
	loader?: Loader,
	opts?: Partial<OptimiseOptions>
}

export function oxipng(options?: Options): Plugin {
	const loader = options?.loader ?? 'file';
	const oxiOpts = options?.opts ?? { level: 3, optimiseAlpha: true };

	async function onLoad(args: OnLoadArgs): Promise<OnLoadResult> {
		const data = await readFile(args.path);
		const optimised = await optimiseOxi(data.buffer, oxiOpts);
		console.log(`OXI ${basename(args.path)}: ${data.length}b -> ${optimised.byteLength}b`)

		return {
			contents: new Uint8Array(optimised),
			loader: loader,
			pluginName: NAMESPACE,
		}
	}

	return {
		name: NAMESPACE,
		setup(build: PluginBuild) {
			build.onLoad({
				filter: FILTER,
				namespace: 'file',
			}, onLoad)
		}
	}
}

async function init() {
	const wasmPath = new URL(import.meta.resolve('@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm'));
	const wasm = await readFile(wasmPath);
	await initOxi(wasm);
}
await init();
