import { POST } from '@/js/xhr';
import { createIsland } from '@common/js/island';

var isSaving = false;
type PopupType = 'announcement' | 'notification';

function markAsRead(id: string, type: 'announcement' | 'notification', cb: (err: null | Error) => void): void {
	if (isSaving) {
		return; // Prevent spamming button
	}

	isSaving = true;
	POST('/news/notifications/' + type + '/' + id + '/mark-read', '', (xhr) => {
		if (xhr.status !== 200) {
			return cb(new Error('HTTP request failed with ' + xhr.status));
		}

		return cb(null);
	});
}

function closePopup(this: HTMLElement): void {
	var notifEl = this.closest('[data-popup-notification]');
	if (!notifEl) {
		return;
	}

	var notifId = notifEl.getAttribute('data-popup-notification');
	var notifType = notifEl.getAttribute('data-popup-notification-type');
	if (!notifId || !notifType) {
		return;
	}

	markAsRead(notifId, notifType as PopupType, function (err) {
		if (err) {
			// log and continue
			console.error('Failed to mark popup as read', err);
		}

		notifEl!.removeAttribute('data-popup-notification-state');
		document.body.removeAttribute('data-stop-scroll');

		var nextNotifId = notifEl!.getAttribute('data-popup-notification-next');
		if (nextNotifId) {
			showPopup(nextNotifId);
		}
	});
}

function showPopup(notifId: string): void {
	var el = document.querySelector('[data-popup-notification="' + notifId + '"]');
	if (!el) {
		return;
	}

	el.setAttribute('data-popup-notification-state', 'open');
	document.body.setAttribute('data-stop-scroll', '');
}

function initPopup(el: HTMLElement, nextNotifId: string | null): void {
	if (nextNotifId) {
		el.setAttribute('data-popup-notification-next', nextNotifId);
	}
}

export var popupNotificationIsland = createIsland({
	id: 'popup-notification',
	selector: '[data-popup-notification-container]',
	onElement: (ctx) => {
		var popups: HTMLElement[] = [];
		ctx.el.querySelectorAll<HTMLElement>('[data-popup-notification]').forEach(el => popups.push(el));

		popups.forEach((el, ind) => {
			var nextEl = ind + 1 < popups.length ? popups[ind + 1] : null;
			var nextNotifId = nextEl?.getAttribute('data-popup-notification') ?? null;
			initPopup(el, nextNotifId);
		});

		var firstPopup: null | HTMLElement = popups[0];
		var firstPopupId = firstPopup?.getAttribute('data-popup-notification');
		if (firstPopupId) {
			showPopup(firstPopupId);
		}
	}
});

export var popupNotificationCloseIsland = createIsland({
	id: 'popup-notification-close',
	selector: '[data-popup-notification] [data-popup-notification-close]',
	onElement: (ctx) => {
		ctx.el.addEventListener('click', closePopup);
	}
});
