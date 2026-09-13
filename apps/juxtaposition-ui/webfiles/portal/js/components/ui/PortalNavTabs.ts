import { GET } from '@common/js/xhr';
import { initMorePosts, initPosts } from '@/js/juxt';
import { pjaxRefresh, pjaxSetUrl } from '@common/js/pjax';

function navTabsClick(this: HTMLElement, ev: Event): void {
	/* Note: because we use ev.target here, the nav-tab can not have any HTML elements inside it.
	 * Only text. */
	var clicked = ev.target as HTMLElement;
	if (!clicked.hasAttribute('data-nav-tab')) {
		// Clicked the edge or something
		return;
	}

	ev.preventDefault();
	wiiuBrowser.showLoadingIcon(true);

	var tabs = this.querySelectorAll('[data-nav-tab]');
	tabs.forEach(t => t.classList.remove('selected'));
	clicked.classList.add('selected');

	var targetSelector = this.getAttribute('data-nav-tabs')!;
	var target = document.querySelector(targetSelector)!;
	var href = clicked.getAttribute('href')!;

	GET(href + '?pjax=true', (xhr) => {
		if (xhr.status !== 200) {
			// Do nothing
			wiiuBrowser.showLoadingIcon(false);
			return;
		}

		target.innerHTML = xhr.responseText;
		pjaxSetUrl(href, true);
		initPosts();
		initMorePosts();
		pjaxRefresh(target);
		wiiuBrowser.showLoadingIcon(false);
	});
}

export function initNavTabs(): void {
	document.querySelectorAll('[data-nav-tabs]').forEach((component) => {
		component.addEventListener('click', navTabsClick);
	});
}
