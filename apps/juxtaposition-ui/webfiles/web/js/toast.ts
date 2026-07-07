export function Toast(text: string, ms?: number): void {
	const toastElement = document.getElementById('toast');
	if (!toastElement) {
		return;
	}
	toastElement.innerText = text;
	toastElement.className = 'show';
	startHideToast(ms ?? 3000);
}

export function initToast(): void {
	const toastElement = document.getElementById('toast');
	if (!toastElement) {
		return;
	}
	const attr = toastElement.getAttribute('data-show');
	if (!attr) {
		return;
	}
	toastElement.removeAttribute('data-show');
	setTimeout(() => Toast(toastElement.innerText, 20000), 100);
}

function startHideToast(ms: number): void {
	setTimeout(function () {
		const toastElement = document.getElementById('toast');
		if (toastElement) {
			toastElement.className = toastElement.className.replace('show', '');
		}
	}, ms);
}