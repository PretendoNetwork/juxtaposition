// Client-side tab control from checkbox.tsx

function updateComponent(component: Element, input: HTMLInputElement): void {
	var sprite = component.querySelector('.sprite')!;
	if (input.checked) {
		component.classList.add('selected');
		sprite.classList.add('selected');
	} else {
		component.classList.remove('selected');
		sprite.classList.remove('selected');
	}
}

export function initCheckboxes(): void {
	document.querySelectorAll('[data-checkbox]').forEach((component) => {
		component.querySelectorAll('input[type="checkbox"]').forEach((input) => {
			input.addEventListener('change', () => updateComponent(component, input as HTMLInputElement));
		});
	});
}
