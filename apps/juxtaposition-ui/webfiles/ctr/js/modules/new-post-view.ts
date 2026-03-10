import { createModule } from '@repo/frontend-common';
import { ctabOnShown } from './controls/ctabs';

function initNewPostView(page: HTMLElement, ctab: Element): void {
	// paintings
	var memo_image = page.querySelector<HTMLImageElement>('img#memo-img-input')!;
	var memo_input = page.querySelector<HTMLInputElement>('input[name="painting"]')!;
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
	ctabOnShown(ctab, 'painting', delayedMemo);
}

function initScreenshotControl(page: HTMLElement, ctab: Element): void {
	// screenshots
	var shot_tab = page.querySelector<HTMLElement>('[data-shot-mode]');
	if (shot_tab === null) {
		return;
	}
	var shotMode = shot_tab.getAttribute('data-shot-mode')!;
	// Hide on game's request
	if (shotMode === 'allow' && !cave.capture_isEnabled()) {
		shot_tab.style.display = 'none';
		return;
	}

	// input type file
	var shotUpload = page.querySelector<HTMLInputElement>('[data-shot-upload]')!;
	// radios
	var shots = page.querySelectorAll<HTMLInputElement>('[data-shot]');
	var shotClear = page.querySelector<HTMLInputElement>('[data-shot-clear]')!;
	// preview
	var shotPreview = page.querySelector<HTMLImageElement>('[data-shot-preview]')!;

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

	ctabOnShown(ctab, 'shot', shot);
}

export var newPostViewModule = createModule({
	id: 'newPostView',
	selector: '#add-post-page',
	hydrate({ el }) {
		var ctab = el.querySelector('[data-ctabs-control]')!;
		initNewPostView(el, ctab);
		initScreenshotControl(el, ctab);
	}
});
