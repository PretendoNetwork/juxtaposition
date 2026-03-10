import { createModule } from '@repo/frontend-common';
import { pjaxLoadUrl } from '@/js/pjax';

export var postsModule = createModule({
	id: 'posts',
	selector: '.post-content[data-href]',
	hydrate: (ctx) => {
		ctx.el.addEventListener('click', function (_e) {
			pjaxLoadUrl(ctx.el.getAttribute('data-href')!, true);
		});
	}
});
