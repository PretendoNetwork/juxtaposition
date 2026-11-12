import { createIsland } from '@common/js/island';

function sendNotification(form: HTMLFormElement): void {
	const formData = new FormData(form);
	const pid = form.getAttribute('data-notification-send-form');
	if (!pid) {
		return;
	}

	const text = formData.get('text');
	fetch(`/admin/accounts/${pid}/notifications`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			text
		})
	})
		.then(response => response.json())
		.then(({ error }) => {
			if (error) {
				throw new Error('Server error');
			}
			alert('Sent notification!');
		})
		.catch((err) => {
			console.error(err);
			alert('Failed to send notification: ' + err);
		});
}

export const notificationSendFormIsland = createIsland({
	id: 'notification-send-form',
	selector: 'form[data-notification-send-form]',
	onElement: (ctx) => {
		ctx.el.addEventListener('submit', (evt) => {
			evt.preventDefault();
			sendNotification(ctx.el as HTMLFormElement);
		});
	}
});
