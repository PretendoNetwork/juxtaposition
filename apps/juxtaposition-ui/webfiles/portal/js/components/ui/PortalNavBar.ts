// TODO re-implement this more nicely
function select(this: Element, _ev: Event): void {
	var els = document.querySelectorAll('#nav-menu > li[data-tab]');
	els.forEach(el => el.classList.remove('selected'));
	this.classList.add('selected');
}

// TODO needs refactor
export function exit(): void {
	// @ts-expect-error missing upstream types
	wiiu.gamepad.update();
	// @ts-expect-error missing upstream types
	if (wiiu.gamepad.hold === 8192 || wiiu.gamepad.hold === 40960) {
		alert('Debug Menu');
	} else {
		// @ts-expect-error wrong upstream types
		wiiuSound.playSoundByName('SE_WAVE_EXIT', 1);
		wiiuBrowser.closeApplication();
	}
}

// TODO needs refactor
export function back(): void {
	if (wiiuBrowser.canHistoryBack()) {
		document.getElementById('nav-menu-back')!.classList.add('selected');
		// @ts-expect-error wrong upstream types
		wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
		history.back();
		document.getElementById('nav-menu')!.style.display = 'block';
	}
}

export function initNavBar(): void {
	var els = document.querySelectorAll('#nav-menu > li[data-tab]');

	els.forEach((el) => {
		el.addEventListener('click', select);
	});

	var navExit = document.querySelector('[data-nav-exit]') as HTMLAnchorElement;
	navExit.href = '#';
	navExit.addEventListener('click', (ev) => {
		ev.preventDefault();
		exit();
	});

	var navBack = document.querySelector('[data-nav-back]') as HTMLAnchorElement;
	navBack.href = '#';
	navBack.addEventListener('click', (ev) => {
		ev.preventDefault();
		back();
	});
}
