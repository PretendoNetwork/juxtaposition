// Toast code duplicated at web.js
function Toast(text) {
	const x = document.getElementById('toast');
	x.innerText = text;
	x.className = 'show';
	startHideToast(3000);
}

function initToast() {
	const x = document.getElementById('toast');
	if (!x) {
		return; // No toast on screen
	}
	const attr = x.getAttribute('data-show');
	if (!attr) {
		return; // Nothing to do
	}

	x.removeAttribute('data-show');
	setTimeout(() => Toast(x.innerText), 100); // Show after a delay so it shows an animation
}

function startHideToast(ms) {
	setTimeout(function () {
		const x = document.getElementById('toast');
		x.className = x.className.replace('show', '');
	}, ms);
}

document.addEventListener('DOMContentLoaded', () => {
	initToast();
});
