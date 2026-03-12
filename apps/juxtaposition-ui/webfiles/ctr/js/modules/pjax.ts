import { createModule } from '@repo/frontend-common';
import { pjaxRefresh } from '@/js/pjax';

export var pjaxModule = createModule({
	id: 'pjax',
	init: () => {
		pjaxRefresh();
	}
});
