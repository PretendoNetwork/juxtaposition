import { createModule } from '@repo/frontend-common';
import { GET } from '@/js/xhr';
import { pjaxRefresh } from '@/js/pjax';

export var morePostsModule = createModule({
	id: 'more-posts',
	selector: '.load-more[data-href]',
	hydrate({ el }) {
		el.addEventListener('click', function (_e: Event) {
			// @ts-expect-error incorrect upstream types for SE label
			cave.snd_playSe('SE_OLV_OK');
			var parent = el.parentElement!;
			var href = el.getAttribute('data-href')!;

			GET(href, function a(data) {
				var response = data.responseText;
				if (response && data.status === 200) {
					parent.outerHTML = response;
					initPosts();
					initMorePosts();
					pjaxRefresh();
				} else {
					parent.outerHTML = '';
				}
			});
		});
	}
});
