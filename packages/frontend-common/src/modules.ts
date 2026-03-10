export type ModuleContext = {
	el: HTMLElement;
}

export type ModuleControls = {
	__type: "module";
	id: string;
	run: (ctx: ModuleContext) => void;
}

export type ModuleContainer = {
	init: () => void;
	loadNode: (el: HTMLElement) => void;
}

export type ModuleOptions = {
	id: string;
	selector: string;
	hydrate: (el: ModuleContext) => void;
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
			ops.hydrate(ctx);
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
			var ctx: ModuleContext = {
				el: document.body,
			}
			runForModule((mod) => mod.run(ctx));
		},
		loadNode(el) {
			var ctx: ModuleContext = {
				el,
			}
			runForModule((mod) => mod.run(ctx));
		}
	}
}
