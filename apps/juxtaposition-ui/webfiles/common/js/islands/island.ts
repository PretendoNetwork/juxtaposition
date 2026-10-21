export type IslandMountHookContext = {
	doc: HTMLElement;
	triggerDoubleHydrate?: () => void;
};

export type IslandElementHookContext = {
	el: HTMLElement;
};

export type IslandControls = {
	id: string;
	run: (ctx: IslandMountHookContext) => void;
};

export type IslandOptions = {
	id: string;
	onMount?: (ctx: IslandMountHookContext) => void;

	selector?: string;
	onElement?: (ctx: IslandElementHookContext) => void;
};

type ElementModuleData = {
	hasHydrated?: boolean;
};

declare global {
	interface Element {
		moduleData?: ElementModuleData;
	}
}

/**
 * Create an island of JS-powered interactivity. Read more at webfiles/common/js/islands/README.md
 */
export function createIsland(ops: IslandOptions): IslandControls {
	return {
		id: ops.id,
		run: function (ctx): void {
			ops.onMount?.(ctx);
			if (ops.selector && ops.onElement) {
				ctx.doc.querySelectorAll(ops.selector).forEach((el) => {
					if (el.moduleData && el.moduleData.hasHydrated) {
						ctx.triggerDoubleHydrate?.();
						return;
					}

					el.moduleData = el.moduleData ?? {};
					el.moduleData.hasHydrated = true;
					ops.onElement?.({ el: el as HTMLElement });
				});
			}
		}
	};
}
