import { createModule } from '@repo/frontend-common';
import { pjaxLoadUrl } from '@/js/pjax';

export var postsModule = createModule({
	id: 'posts',
	selector: '.post-content[data-href]',
	hydrate({ el }) {
		el.addEventListener('click', function (_e) {
			pjaxLoadUrl(el.getAttribute('data-href')!, true);
		});
	}
});
