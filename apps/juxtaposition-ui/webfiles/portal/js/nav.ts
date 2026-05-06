// TODO needs refactor
export function exit(): void {
	// @ts-expect-error wrong upstream types
	wiiuSound.playSoundByName('SE_WAVE_EXIT', 1);
	wiiuBrowser.closeApplication();
}

// TODO needs refactor
export function back(): void {
	if (!wiiuBrowser.canHistoryBack()) {
		return;
	}

	// Doing this here so if the B button is pressed we still get the visuals updated
	// Class should get removed by PJAX
	document.querySelector('[data-navbar-back]')!.classList.add('selected');
	// @ts-expect-error wrong upstream types
	wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
	history.back();
	(document.querySelector('[data-navbar]') as HTMLElement).style.display = 'block';
}
