import type { IslandControls, IslandMountHookContext } from '@common/js/islands/island';

export type IslandArray = IslandControls[];

export type IslandContainerOptions = {
	islands?: IslandArray;
};

export type IslandContainer = {
	register: (mod: IslandArray) => void;
	loadBody: () => void;
	loadPartial: (el: HTMLElement) => void;
};

export function createIslandContainer(ops?: IslandContainerOptions): IslandContainer {
	var islands: IslandControls[] = [];
	function registerManyIslands(islandArr: IslandArray): void {
		islands = islands.concat(islandArr);
	}

	// Register input modules
	if (ops && ops.islands) {
		registerManyIslands(ops.islands);
	}

	return {
		register: registerManyIslands,
		loadBody: function (): void {
			this.loadPartial(document.body);
		},
		loadPartial: function (el): void {
			var hasDoubleHydrated = false;

			var ctx: IslandMountHookContext = {
				doc: el,
				triggerDoubleHydrate: () => hasDoubleHydrated = true
			};
			islands.forEach(function (island) {
				island.run(ctx);
			});

			if (hasDoubleHydrated) {
				var text = 'Double hydration detected, have you called loadPartial twice?';
				console.warn(text);
				alert(text);
			}
		}
	};
}
