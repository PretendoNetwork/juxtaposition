import { ModuleControls, ModuleRunContext } from "./modules";

export type DeepArray<T> = T | Array<DeepArray<T>>;
export type DeepModules = DeepArray<ModuleControls>;

export type ModuleContainerOptions = {
	modules?: DeepModules;
	onLoadFinished?: () => void;
}

export type ModuleContainer = {
	register: (mod: DeepModules) => void;
	loadBody: () => void;
	loadPartial: (el: HTMLElement) => void;
}

function extractDeepArrayModules(input: DeepModules): ModuleControls[] {
	if (Array.isArray(input)) {
		var output = [];
		for (var i = 0; i < input.length; i++) {
			var result = extractDeepArrayModules(input[i]);
			for (var j = 0; i < result.length; j++) {
				output.push(result[j]);
			}
		}
		return output;
	}

	if ((input as ModuleControls).__type === 'module') {
		return [input];
	}

	throw new Error("Expected ModuleControls, got '" + JSON.stringify(input) + "' instead.")
}

export function createModuleContainer(ops?: ModuleContainerOptions): ModuleContainer {
	var modules: ModuleControls[] = [];
	var moduleMap: Record<string, ModuleControls> = {};
	function registerModule(mod: ModuleControls): void {
		if (moduleMap[mod.id]) {
			throw new Error("Module '" + mod.id + "' already exists in container");
		}
		moduleMap[mod.id] = mod;
		modules.push(mod);
	}
	function registerManyModules(mods: DeepArray<ModuleControls>): void {
		var extracted = extractDeepArrayModules(mods);
		for (let i = 0; i < extracted.length; i++) {
			registerModule(extracted[i]);
		}
	}

	// Register input modules
	if (ops && ops.modules) {
		registerManyModules(ops.modules)
	}

	return {
		register: registerManyModules,
		loadBody() {
			this.loadPartial(document.body);
		},
		loadPartial(el) {
			var ctx: ModuleRunContext = {
				doc: el,
			}
			for (let i = 0; i < modules.length; i++) {
				var mod = modules[i];
				mod.run(ctx)
			}

			if (ops?.onLoadFinished) ops.onLoadFinished();
		}
	}
}
