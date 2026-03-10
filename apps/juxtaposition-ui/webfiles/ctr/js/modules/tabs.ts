import { createModule } from '@repo/frontend-common';
import { GET } from '@/js/xhr';
import { pjaxRefresh } from '@/js/pjax';

function handleTabs(doc: HTMLElement): void {
	var els = doc.querySelectorAll<HTMLElement>('.tab-button');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', tabs);
	}

	function tabs(e: Event): void {
		e.preventDefault();
		cave.transition_begin();
		var el = e.currentTarget as HTMLElement;
		var child = el.children[0];

		for (var i = 0; i < els.length; i++) {
			els[i].classList.remove('selected');
		}
		el.classList.add('selected');

		GET(child.getAttribute('href') + '?pjax=true', function a(data) {
			var response = data.responseText;
			if (response && data.status === 200) {
				document.getElementsByClassName('tab-body')[0].innerHTML = response;
				initPosts();
				initMorePosts();
				pjaxRefresh();
				cave.transition_end();
			}
		});
	}
}

export var tabsModule = createModule({
	id: 'tabs',
	selector: '.tab-button',
	init({ doc }) {
		handleTabs(doc);
	}
});
