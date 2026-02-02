import { ctabOnShown } from './ctabs';

export function initNewPostView(): void {
	var page = document.querySelector('#add-post-page');
	if (!page) {
		return;
	}

	// paintings
	var memo_image = page.querySelector('img#memo-img-input')! as HTMLImageElement;
	var memo_input = page.querySelector('input[name="painting"]')! as HTMLInputElement;
	function memo(): void {
		cave.memo_open();
		if (!cave.memo_hasValidImage()) {
			return;
		}

		var image_data = cave.memo_getImageBmp();
		memo_image.src = 'data:image/bmp;base64,' + image_data;
		memo_input.value = image_data;
	}
	// Let click animations finish playing before calling memo open
	function delayedMemo(): void {
		setTimeout(memo, 75);
	}
	memo_image.addEventListener('click', delayedMemo);

	// screenshots
	var shotTab = page.querySelector('[data-ctab-value="shot"]') as HTMLElement;
	// input type file
	var shotUpload = page.querySelector('[data-shot-upload]') as HTMLInputElement;
	// radios
	var shots = page.querySelectorAll('[data-shot]') as NodeListOf<HTMLInputElement>;
	var shotClear = page.querySelector('[data-shot-clear]') as HTMLInputElement;
	// preview
	var shotPreview = page.querySelector('[data-shot-preview]') as HTMLImageElement;

	// shot settings
	var shotMode = shotUpload.getAttribute('data-shot-mode')!;
	var shotTids = shotUpload.getAttribute('data-shot-tids')!;

	if (!shotAllowed(shotMode, shotTids)) {
		// very convenient how this is the middle tab eh
		shotTab.style.display = 'none';
	}

	// top/bottom screen picker
	function pickShot(e: Event): void {
		var me = e.currentTarget as HTMLInputElement;
		var lls = me.getAttribute('data-lls')!;

		shotPreview.style.backgroundImage = `url(${cave.lls_getPath(lls)})`;
		shotUpload.setAttribute('lls', lls);
	}
	shots.forEach(s => s.addEventListener('change', pickShot));

	// has to be enabled at submission
	page.addEventListener('submit', () => {
		// Fidget with disabled to keep it out of the D-pad navigation
		shotUpload.disabled = false;
		shotUpload.focus();
		shotUpload.click();
		shotUpload.blur();
	});

	// reset/clear button
	shotClear.addEventListener('change', () => {
		shotPreview.style.backgroundImage = '';
		shotUpload.removeAttribute('lls');
		shotUpload.value = '';
	});

	// actually populate the images after page load (laggy)
	function shot(e: Event): void {
		shots.forEach((s) => {
			var num = parseInt(s.getAttribute('data-shot')!);
			var lls = s.getAttribute('data-lls')!;

			cave.lls_setCaptureImage(lls, num);
			s.style.backgroundImage = `url(${cave.lls_getPath(lls)})`;
		});

		// no need to call more than once per load
		e.currentTarget?.removeEventListener(e.type, shot);
	}

	// Set up tab control
	var ctab = page.querySelector('.ctabs')!;
	ctabOnShown(ctab, 'painting', delayedMemo);
	ctabOnShown(ctab, 'shot', shot);
}

function shotAllowed(shotMode: string, shotTids: string): boolean {
	// Always block
	if (shotMode === 'block') {
		return false;
	}

	// Block if game says no (capture_isEnabled)
	if ((!shotMode || shotMode === 'allow') && !cave.capture_isEnabled()) {
		return false;
	}

	if (shotTids !== 'all') {
		var gameTid = parseInt(cave.sap_programId(), 16);
		// yes, server sends title ids in decimal
		var tids = shotTids.split(',').map(x => parseInt(x));

		// Block if this is the wrong community
		if (!tids.includes(gameTid)) {
			return false;
		}
	}

	return true;
}
