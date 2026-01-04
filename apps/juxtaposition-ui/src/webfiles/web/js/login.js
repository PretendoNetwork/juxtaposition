function hideToast() {
	const toast = document.getElementById('toast');
	window.setTimeout(function () {
		toast.className = toast.className.replace('show', '');
	}, 20000);
}

document.addEventListener('DOMContentLoaded', () => {
	hideToast();
});
