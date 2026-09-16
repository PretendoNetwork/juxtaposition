export type IslandMountContext = {
	doc: HTMLElement;
	triggerDoubleHydrate?: () => void;
};

export type IslandHydrateContext = {
	el: HTMLElement;
};

export type IslandControls = {
	id: string;
	run: (ctx: IslandMountContext) => void;
};

export type IslandOptions = {
	id: string;
	mount?: (ctx: IslandMountContext) => void;

	selector?: string;
	hydrate?: (ctx: IslandHydrateContext) => void;
};

type ElementModuleData = {
	hasHydrated?: boolean;
};

declare global {
	interface Element {
		moduleData?: ElementModuleData;
	}
}

export function createIsland(ops: IslandOptions): IslandControls {
	return {
		id: ops.id,
		run: function (ctx): void {
			ops.mount?.(ctx);
			if (ops.selector && ops.hydrate) {
				ctx.doc.querySelectorAll(ops.selector).forEach((el) => {
					if (el.moduleData && el.moduleData.hasHydrated) {
						ctx.triggerDoubleHydrate?.();
						return;
					}

					el.moduleData = el.moduleData ?? {};
					el.moduleData.hasHydrated = true;
					ops.hydrate?.({ el: el as HTMLElement });
				});
			}
		}
	};
}
