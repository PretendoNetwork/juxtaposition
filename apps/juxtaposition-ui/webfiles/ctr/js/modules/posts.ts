import { createModule } from '@repo/frontend-common';
import { pjaxLoadUrl } from '@/js/pjax';

function postClick(e: Event): void {
	var target = e.currentTarget as HTMLElement;
	pjaxLoadUrl(target.getAttribute('data-href')!, true);
}

export var postsModule = createModule({
	id: 'posts',
	selector: '.post-content[data-href]',
	hydrate: (ctx) => {
		ctx.el.addEventListener('click', postClick);
	}
});
