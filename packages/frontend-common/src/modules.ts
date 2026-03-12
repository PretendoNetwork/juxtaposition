export type ModuleRunContext = {
	doc: HTMLElement;
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

export function createModule(ops: ModuleOptions): ModuleControls {
	return {
		id: ops.id,
		run: function (ctx): void {
			ops.init?.(ctx);
			if (ops.selector && ops.hydrate) {
				ctx.doc.querySelectorAll(ops.selector).forEach((el) => {
					ops.hydrate?.({ el: el as HTMLElement });
				});
			}
		}
	};
}
