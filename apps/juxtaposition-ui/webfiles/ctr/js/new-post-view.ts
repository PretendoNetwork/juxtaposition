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
	// input type file
	var shotUpload = page.querySelector('[data-shot-upload]') as HTMLInputElement;
	// radios
	var shots = page.querySelectorAll('[data-shot]') as NodeListOf<HTMLInputElement>;
	var shotClear = page.querySelector('[data-shot-clear]') as HTMLInputElement;
	// preview
	var shotPreview = page.querySelector('[data-shot-preview]') as HTMLImageElement;

	// top/bottom screen picker
	function pickShot(e: Event): void {
		var me = e.currentTarget as HTMLInputElement;
		var lls = me.getAttribute('data-lls')!;

		shotPreview.style.backgroundImage = `url(${cave.lls_getPath(lls)})`;
		shotUpload.setAttribute('lls', lls);

		shotUpload.focus();
		shotUpload.click();
		me.focus();
	}
	shots.forEach(s => s.addEventListener('change', pickShot));

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
