export type ModuleRunContext = {
	doc: HTMLElement;
	triggerDoubleHydrate?: () => void;
};

export type ModuleHydrateContext = {
	el: HTMLElement;
};

export type ModuleControls = {
	id: string;
	run: (ctx: ModuleRunContext) => void;
};

export type ModuleOptions = {
	id: string;
	init?: (ctx: ModuleRunContext) => void;

	selector?: string;
	hydrate?: (ctx: ModuleHydrateContext) => void;
};

type ElementModuleData = {
	hasHydrated?: boolean;
};

declare global {
	interface Element {
		moduleData?: ElementModuleData;
	}
}

export function createModule(ops: ModuleOptions): ModuleControls {
	return {
		id: ops.id,
		run: function (ctx): void {
			ops.init?.(ctx);
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
