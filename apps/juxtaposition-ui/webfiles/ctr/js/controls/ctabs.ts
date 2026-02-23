// Client-side tab control from ctabs.tsx

function updateComponent(component: Element): void {
	component.querySelectorAll('[data-ctab]').forEach((tab) => {
		var input = tab.querySelector('input')!;
		var sprite = tab.querySelector('.sprite')!;
		var value = input.value;
		var content = component.querySelector(`[data-ctab-content="${value}"]`);

		if (input.checked) {
			tab.classList.add('selected');
			sprite.classList.add('selected');
			content?.dispatchEvent(new Event('ctab-shown'));
		} else {
			tab.classList.remove('selected');
			sprite.classList.remove('selected');
		}
	});
}

export function initClientTabs(): void {
	document.querySelectorAll('[data-ctabs-control]').forEach((component) => {
		component.querySelectorAll('[data-ctab] input[type="radio"]').forEach((input) => {
			input.addEventListener('change', () => updateComponent(component));
		});
	});
}

export function ctabOnShown(component: Element, value: string, cb: EventListenerOrEventListenerObject): boolean {
	var content = component.querySelector(`[data-ctab-content="${value}"]`);
	if (!content) {
		return false;
	}

	content.addEventListener('ctab-shown', cb);
	return true;
}
