import { GET } from '../../xhr';
import { initMorePosts, initPosts, pjax } from '../../juxt';

function navTabsClick(this: HTMLElement, ev: Event): void {
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
		window.history.pushState({ url: href, title: '', scrollPos: [0, 0] }, '', href);
		initPosts();
		initMorePosts();
		pjax.refresh();
		wiiuBrowser.showLoadingIcon(false);
	});
}

export function initNavTabs(): void {
	document.querySelectorAll('[data-nav-tabs]').forEach((component) => {
		component.addEventListener('click', navTabsClick);
	});
}
