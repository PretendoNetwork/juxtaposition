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

	// Set up tab control
	var ctab = page.querySelector('[data-ctabs-control]')!;
	ctabOnShown(ctab, 'painting', delayedMemo);
}
