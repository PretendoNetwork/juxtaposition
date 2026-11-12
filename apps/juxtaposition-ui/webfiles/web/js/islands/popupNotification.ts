import { createIsland } from '@common/js/island';

function closePopup(this: HTMLElement): void {
	const notifEl = this.closest('[data-popup-notification]');
	if (!notifEl) {
		return;
	}

	notifEl.removeAttribute('data-popup-notification-state');

	const nextNotifId = notifEl.getAttribute('data-popup-notification-next');
	if (nextNotifId) {
		showPopup(nextNotifId);
	}
}

function showPopup(notifId: string): void {
	const el = document.querySelector('[data-popup-notification="' + notifId + '"]');
	if (!el) {
		return;
	}

	el.setAttribute('data-popup-notification-state', 'open');
}

function initPopup(el: HTMLElement, nextNotifId: string | null): void {
	if (nextNotifId) {
		el.setAttribute('data-popup-notification-next', nextNotifId);
	}
}

export const popupNotificationIsland = createIsland({
	id: 'popup-notification',
	selector: '[data-popup-notification-container]',
	onElement: (ctx) => {
		const popups = [...ctx.el.querySelectorAll<HTMLElement>('[data-popup-notification]')];
		popups.forEach((el, ind) => {
			const nextEl = ind + 1 < popups.length ? popups[ind + 1] : null;
			const nextNotifId = nextEl?.getAttribute('data-popup-notification') ?? null;
			initPopup(el, nextNotifId);
		});

		const firstPopup: null | HTMLElement = popups[0];
		const firstPopupId = firstPopup?.getAttribute('data-popup-notification');
		if (firstPopupId) {
			showPopup(firstPopupId);
		}
	}
});

export const popupNotificationCloseIsland = createIsland({
	id: 'popup-notification-close',
	selector: '[data-popup-notification] [data-popup-notification-close]',
	onElement: (ctx) => {
		ctx.el.addEventListener('click', closePopup);
	}
});
