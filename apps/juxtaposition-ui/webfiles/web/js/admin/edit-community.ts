function updateUploadPreview(this: HTMLInputElement, _ev: Event): void {
	if (!this.files || this.files.length < 1) {
		return;
	}

	const [file] = this.files;
	document.querySelectorAll(`[data-image-preview-for="${this.id}"]`).forEach((el) => {
		(el as HTMLImageElement).src = URL.createObjectURL(file);
	});
}

export function initUploadPreview(): void {
	document.querySelectorAll('[data-image-preview]').forEach((el) => {
		el.addEventListener('change', updateUploadPreview);
	});
}
