import { GET } from '../../xhr';
import { pjaxPushHistory, pjaxRefresh } from '../../pjax';
import { initMorePosts, initPosts } from '../../juxt';

function navTabsClick(this: HTMLElement, ev: Event): void {
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
	var target = document.querySelector(targetSelector)!;
	var href = clicked.getAttribute('href')!;

	GET(href + '?pjax=true', (xhr) => {
		if (xhr.status !== 200) {
			// Do nothing
			cave.transition_end();
			return;
		}

		target.innerHTML = xhr.responseText;
		pjaxPushHistory(href);
		initPosts();
		initMorePosts();
		pjaxRefresh();
		cave.transition_end();
	});
}

export function initNavTabs(): void {
	document.querySelectorAll('[data-nav-tabs]').forEach((component) => {
		component.addEventListener('click', navTabsClick);
	});
}
