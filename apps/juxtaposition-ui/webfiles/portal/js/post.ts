// Script for the post page view (post.ejs/postPageView.tsx)
import { deletePostById } from './api';

function deletePost(this: HTMLElement, _e: Event): void {
	var id = this.getAttribute('data-post');
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
	var del = document.querySelector('.button.delete');
	if (!del) {
		return;
	}

	(del as HTMLElement).addEventListener('click', deletePost);

	// delete buttons from post template
	// TODO this is kinda out of place here
	document.querySelectorAll('button.remove').forEach((button) => {
		(button as HTMLElement).addEventListener('click', deletePost);
	});
}

export function initPostPageView(): void {
	initDeleteButton();
}
