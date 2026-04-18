import { createModule } from '@repo/frontend-common';
import { modules } from '@/js/module-container';
import { pjaxPushHistory } from '@/js/pjax';
import { GET } from '@/js/xhr';

function navTabsClick(this: HTMLElement, ev: Event): void {
	/* Note: because we use ev.target here, the nav-tab can not have any HTML elements inside it.
	 * Only text. */
	var clicked = ev.target as HTMLElement;
	if (!clicked.hasAttribute('data-nav-tab')) {
		// Clicked the edge or something
		return;
	}

	ev.preventDefault();
	cave.transition_begin();

	var tabs = this.querySelectorAll('[data-nav-tab]');
	tabs.forEach(t => t.classList.remove('selected'));
	clicked.classList.add('selected');

	var targetSelector = this.getAttribute('data-nav-tabs')!;
	var target = document.querySelector<HTMLElement>(targetSelector)!;
	var href = clicked.getAttribute('href')!;

	GET(href + '?pjax=true', (xhr) => {
		if (xhr.status !== 200) {
			// Do nothing
			cave.transition_end();
			return;
		}

		target.innerHTML = xhr.responseText;
		pjaxPushHistory(href);
		modules.loadPartial(target);
		cave.transition_end();
	});
}

export var tabsModule = createModule({
	id: 'tabs',
	selector: '[data-nav-tabs]',
	hydrate: (ctx) => {
		ctx.el.addEventListener('click', navTabsClick);
	}
});
