// Client-side tab control from ctabs.tsx

function updateComponent(component: Element): void {
	component.querySelectorAll('.ctab').forEach((tab) => {
		var input = tab.querySelector('input')!;
		var sprite = tab.querySelector('.sprite')!;

		if (input.checked) {
			tab.classList.add('selected');
			sprite.classList.add('selected');
		} else {
			tab.classList.remove('selected');
			sprite.classList.remove('selected');
		}
	});
}

export function initClientTabs(): void {
	document.querySelectorAll('.ctabs').forEach((component) => {
		component.querySelectorAll('.ctab input[type="radio"]').forEach((input) => {
			input.addEventListener('change', () => updateComponent(component));
		});
	});
}
