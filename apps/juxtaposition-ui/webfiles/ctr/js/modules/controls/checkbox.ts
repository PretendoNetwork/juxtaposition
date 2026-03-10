import { createModule } from '@repo/frontend-common';

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

export var checkboxModule = createModule({
	id: 'checkbox',
	selector: '[data-checkbox]',
	hydrate: (ctx) => {
		ctx.el.querySelectorAll('input[type="checkbox"]').forEach((input) => {
			input.addEventListener('change', () => updateComponent(ctx.el, input as HTMLInputElement));
		});
	}
});
