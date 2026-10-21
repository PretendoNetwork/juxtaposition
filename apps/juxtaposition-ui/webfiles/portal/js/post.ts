// Script for the post page view (postPageView.tsx)
import { deletePostById } from '@/js/api';

function deletePost(this: HTMLElement, _e: Event): void {
	var id = this.getAttribute('data-button-delete-post');
	if (!id) {
		return;
	}

	var confirm = wiiuDialog.confirm(
		'Are you sure you want to delete your post? This cannot be undone.',
		'No',
		'Yes'
	);
	if (!confirm) {
		return;
	}

	deletePostById(id, null, function (response) {
		if (response.status !== 200) {
			return wiiuErrorViewer.openByCodeAndMessage(
				5980030,
				'Post was not able to be deleted. Please try again later.'
			);
		}

		alert('Post has been deleted.');
		window.location.href = response.nextUrl;
	});
}

function initDeleteButton(): void {
	var buttons = document.querySelectorAll('[data-button-delete-post]');
	for (var i = 0; i < buttons.length; i++) {
		(buttons[i] as HTMLElement).addEventListener('click', deletePost);
	}
}

function unspoilerPost(this: HTMLButtonElement, _e: Event): void {
	var spoilerWrapper = document.getElementById('spoiler-' + this.getAttribute('data-post-id'))!;
	var postEl = document.getElementById('post-' + this.getAttribute('data-post-id'))!;

	postEl.classList.remove('spoiler');
	spoilerWrapper.outerHTML = '';
}

export function initSpoilers(posts: Element | Document | DocumentFragment): void {
	posts.querySelectorAll('button[data-post-id]').forEach((el) => {
		el.addEventListener('click', unspoilerPost);
	});
}

export function initPostPageView(): void {
	initDeleteButton();
}
