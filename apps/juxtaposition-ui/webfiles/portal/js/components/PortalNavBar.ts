import { back, exit } from '@/js/nav';
import { pjaxCanGoBack } from '@common/js/pjax';

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

function updateBackButton(): void {
	var back = document.getElementById('nav-menu-back');
	var close = document.getElementById('nav-menu-exit');
	if (!back || !close) {
		return;
	}

	if (pjaxCanGoBack()) {
		back.classList.remove('selected');
		back.classList.remove('none');
		close.classList.add('none');
	} else {
		back.classList.remove('selected');
		back.classList.add('none');
		close.classList.remove('none');
	}
}

export function initNavBar(): void {
	var components = document.querySelectorAll('[data-navbar]');
	components.forEach((navbar) => {
		navbar.querySelectorAll('[data-navbar-tab]').forEach((el) => {
			el.addEventListener('click', select);
		});

		var navExit = navbar.querySelector<HTMLAnchorElement>('[data-navbar-exit]')!;
		navExit.href = '#';
		navExit.addEventListener('click', exitButton);

		var navBack = navbar.querySelector<HTMLAnchorElement>('[data-navbar-back]')!;
		navBack.href = '#';
		navBack.addEventListener('click', backButton);
	});

	updateBackButton();
}
