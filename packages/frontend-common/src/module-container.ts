import type { ModuleControls, ModuleRunContext } from './modules';

export type ModulesArray = ModuleControls[];

export type ModuleContainerOptions = {
	modules?: ModulesArray;
};

export type ModuleContainer = {
	register: (mod: ModulesArray) => void;
	loadBody: () => void;
	loadPartial: (el: HTMLElement) => void;
};

export function createModuleContainer(ops?: ModuleContainerOptions): ModuleContainer {
	var modules: ModuleControls[] = [];
	function registerManyModules(mods: ModulesArray): void {
		for (var i = 0; i < mods.length; i++) {
			modules.push(mods[i]);
		}
	}

	// Register input modules
	if (ops && ops.modules) {
		registerManyModules(ops.modules);
	}

	return {
		register: registerManyModules,
		loadBody: function (): void {
			this.loadPartial(document.body);
		},
		loadPartial: function (el): void {
			var ctx: ModuleRunContext = {
				doc: el
			};
			for (var i = 0; i < modules.length; i++) {
				var mod = modules[i];
				mod.run(ctx);
			}
		}
	};
}
