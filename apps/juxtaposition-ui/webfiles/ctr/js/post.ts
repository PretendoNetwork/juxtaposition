// Script for the post view (post.tsx)
import { DELETE } from './xhr';

function deletePost(post: HTMLElement): void {
	var id = post.getAttribute('data-post');
	if (!id) {
		return;
	}
	var confirm = cave.dialog_twoButton(
		'Delete Post',
		'Are you sure you want to delete your post? This cannot be undone.',
		'No',
		'Yes'
	);
	if (confirm) {
		DELETE('/posts/' + id, function a(data) {
			if (!data || data.status !== 200) {
				return cave.error_callFreeErrorViewer(
					// @ts-expect-error wrong upstream
					'5980030',
					'Post was not able to be deleted. Please try again later.'
				);
			}
			console.log(data);
			alert('Post has been deleted.');
			return (window.location.href = data.responseText);
		});
	}
}
// @ts-expect-error window method hack for onclick
window.deletePost = deletePost;
