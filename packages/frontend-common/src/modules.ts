export type ModuleRunContext = {
	doc: HTMLElement;
}

export type ModuleHydrateContext = {
	el: HTMLElement;
}

export type ModuleControls = {
	__type: "module";
	id: string;
	run: (ctx: ModuleRunContext) => void;
}

export type ModuleContainer = {
	init: () => void;
	loadNode: (el: HTMLElement) => void;
}

export type ModuleOptions = {
	id: string;
	init?: (el: ModuleRunContext) => void;

	selector?: string;
	hydrate?: (el: ModuleHydrateContext) => void;
}

export function extractModulesFromInput(input: any): ModuleControls[] {
	if (Array.isArray(input)) {
		var output = [];
		for (var i = 0; i < input.length; i++) {
			var result = extractModulesFromInput(input[i]);
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

export function createModule(ops: ModuleOptions): ModuleControls {
	return {
		__type: "module",
		id: ops.id,
		run(ctx) {
			ops.init?.(ctx);
			if (ops.selector && ops.hydrate) {
				ctx.doc.querySelectorAll(ops.selector).forEach(el => {
					ops.hydrate?.({ el: el as HTMLElement })
				})
			}
		},
	}
}

export function createModuleContainer(modules: ModuleControls[]): ModuleContainer {
	var moduleMap: Record<string, ModuleControls> = {};
	for (let i = 0; i < modules.length; i++) {
		var mod = modules[i];
		if (moduleMap[mod.id]) {
			throw new Error("Module '" + mod.id + "' already exists in container");
		}
		moduleMap[mod.id] = mod;
	}

	function runForModule(cb: (mod: ModuleControls) => void): void {
		for (let i = 0; i < modules.length; i++) {
			var mod = modules[i];
			cb(mod);
		}
	}

	return {
		init() {
			var ctx: ModuleRunContext = {
				doc: document.body,
			}
			runForModule((mod) => mod.run(ctx));
		},
		loadNode(el) {
			var ctx: ModuleRunContext = {
				doc: el,
			}
			runForModule((mod) => mod.run(ctx));
		}
	}
}
