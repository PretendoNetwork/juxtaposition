// Script for the post page view (post.ejs/postPageView.tsx)
import { DELETE } from './xhr';

function deletePost(this: HTMLElement, _e: Event): void {
	var id = this.getAttribute('data-post');
	if (!id) {
		return;
	}

	var confirm = cave.dialog_twoButton(
		'Delete Post',
		'Are you sure you want to delete your post? This cannot be undone.',
		'No',
		'Yes'
	);
	if (!confirm) {
		return;
	}

	DELETE('/posts/' + id, function (xhr) {
		if (!xhr || xhr.status !== 200) {
			return cave.error_callFreeErrorViewer(
				5980030,
				'Post was not able to be deleted. Please try again later.'
			);
		}
		alert('Post has been deleted.');
		window.location.href = xhr.responseText;
	});
}

function initDeleteButton(): void {
	var del = document.querySelector('.header-button.delete');
	if (!del) {
		return;
	}

	(del as HTMLElement).addEventListener('click', deletePost);
}

export function initPostPageView(): void {
	initDeleteButton();
}
