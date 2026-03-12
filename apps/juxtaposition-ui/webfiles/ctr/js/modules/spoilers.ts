import { createModule } from '@repo/frontend-common';

function spoilerButton(e: Event): void {
	var spoilerButtonTarget = e.target as HTMLElement;
	var target = document.getElementById('post-' + spoilerButtonTarget.getAttribute('data-post-id'))!;
	target.classList.remove(
		'spoiler'
	);
	spoilerButtonTarget.outerHTML = '';
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
