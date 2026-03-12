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
			var hasDoubleHydrated = false;

			var ctx: ModuleRunContext = {
				doc: el,
				triggerDoubleHydrate: () => hasDoubleHydrated = true
			};
			for (var i = 0; i < modules.length; i++) {
				var mod = modules[i];
				mod.run(ctx);
			}

			if (hasDoubleHydrated) {
				var text = 'Double hydration detected, have you called loadPartial twice?';
				console.warn(text);
				alert(text);
			}
		}
	};
}
