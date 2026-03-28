import { createModule } from '@repo/frontend-common';

function spoilerButton(e: Event): void {
	var spoilerButtonTarget = e.target as HTMLElement;
	var spoilerWrapper = document.getElementById('spoiler-' + spoilerButtonTarget.getAttribute('data-post-id'))!;
	var postEl = document.getElementById('post-' + spoilerButtonTarget.getAttribute('data-post-id'))!;

	postEl.classList.remove('spoiler');
	spoilerWrapper.outerHTML = '';

	// @ts-expect-error incorrect upstream types for SE label
	cave.snd_playSe('SE_OLV_OK');
}

export var spoilersModule = createModule({
	id: 'spoilers',
	selector: 'button[data-post-id]',
	hydrate: (ctx) => {
		ctx.el.addEventListener('click', spoilerButton);
	}
});
