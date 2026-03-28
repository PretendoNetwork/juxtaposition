import { createModule } from '@repo/frontend-common';
import { GET } from '@/js/xhr';
import { modules } from '@/js/module-container';

function morePostsClick(e: Event): void {
	// @ts-expect-error incorrect upstream types for SE label
	cave.snd_playSe('SE_OLV_OK');
	var button = e.currentTarget as HTMLElement;
	var parent = button.parentElement!;
	var href = button.getAttribute('data-href')!;

	GET(href, function a(data) {
		var response = data.responseText;
		if (response && data.status === 200) {
			parent.outerHTML = response;
			modules.loadPartial(parent);
		} else {
			parent.outerHTML = '';
		}
	});
}

export var morePostsModule = createModule({
	id: 'more-posts',
	selector: '.load-more[data-href]',
	hydrate: (ctx) => {
		ctx.el.addEventListener('click', morePostsClick);
	}
});
