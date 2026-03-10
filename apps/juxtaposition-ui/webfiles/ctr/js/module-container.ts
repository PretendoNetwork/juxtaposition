import { createModuleContainer } from '@repo/frontend-common';
import { pjaxRefresh } from '@/js/pjax';

// Actual modules are registered in entrypoint to avoid cyclic imports
export var modules = createModuleContainer({
	onLoadFinished() {
		pjaxRefresh();
	}
});
