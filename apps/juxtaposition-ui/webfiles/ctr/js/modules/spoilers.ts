import { createModule } from '@repo/frontend-common';

export var spoilersModule = createModule({
	id: 'spoilers',
	selector: 'button[data-post-id]',
	hydrate: (ctx) => {
		ctx.el.addEventListener('click', function (_e) {
			var target = document.getElementById('post-' + ctx.el.getAttribute('data-post-id'))!;
			target.classList.remove(
				'spoiler'
			);
			target.outerHTML = '';
			// @ts-expect-error incorrect upstream types for SE label
			cave.snd_playSe('SE_OLV_OK');
		});
	}
});
