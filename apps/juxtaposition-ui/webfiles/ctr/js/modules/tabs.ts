import { createModule } from '@repo/frontend-common';
import { GET } from '@/js/xhr';
import { modules } from '@/js/module-container';

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
			var parent = document.querySelectorAll<HTMLElement>('.tab-body')[0];
			if (response && data.status === 200) {
				parent.innerHTML = response;
				modules.loadPartial(parent);
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
