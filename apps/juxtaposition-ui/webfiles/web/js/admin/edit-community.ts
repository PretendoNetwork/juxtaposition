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

function updateTitleIdControl(this: HTMLTextAreaElement, _ev: Event): void {
	const input = document.querySelector(this.getAttribute('data-input-admin-title-ids')!) as HTMLInputElement;

	const tids = this.value.split('\n')
		.map(l => l.trim().replaceAll('-', ''))
		.map((line) => {
			// Leading 0 is probably 00050000101C9400 or similar - use hex
			const radix = line.startsWith('0') ? 16 : 10;

			let val;
			try {
				val = parseInt(line, radix);
			} catch (e) {
				console.warn(e);
				return null;
			}

			return val;
		})
		.filter(v => v !== null);

	input.value = tids.join(',');
}

export function initTitleIdControl(): void {
	document.querySelectorAll('[data-input-admin-title-ids]').forEach((el) => {
		const input = document.querySelector(el.getAttribute('data-input-admin-title-ids')!) as HTMLInputElement;
		const tids = input.value.split(',').map(s => parseInt(s.trim(), 10));

		const hexTids = tids
			.map(t => t.toString(16).padStart(16, '0').toUpperCase())
			.map(t => t.slice(0, 8) + '-' + t.slice(8));

		(el as HTMLTextAreaElement).value = hexTids.join('\n');
		(el as HTMLTextAreaElement).addEventListener('change', updateTitleIdControl);
	});
}
