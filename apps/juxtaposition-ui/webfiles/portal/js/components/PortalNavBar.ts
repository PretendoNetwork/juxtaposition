import { back, exit } from '../nav';

function select(this: Element, _ev: Event): void {
	var component = this.closest('[data-navbar]')!;
	var tabs = component.querySelectorAll('[data-navbar-tab]');

	tabs.forEach(el => el.classList.remove('selected'));
	this.classList.add('selected');
}

function exitButton(ev: Event): void {
	ev.preventDefault();
	exit();
}

function backButton(ev: Event): void {
	ev.preventDefault();
	back();
}

export function initNavBar(): void {
	var components = document.querySelectorAll('[data-navbar]');
	components.forEach((navbar) => {
		navbar.querySelectorAll('[data-navbar-tab]').forEach((el) => {
			el.addEventListener('click', select);
		});

		var navExit = navbar.querySelector('[data-navbar-exit]') as HTMLAnchorElement;
		navExit.href = '#';
		navExit.addEventListener('click', exitButton);

		var navBack = navbar.querySelector('[data-navbar-back]') as HTMLAnchorElement;
		navBack.href = '#';
		navBack.addEventListener('click', backButton);
	});
}
