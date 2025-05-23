export function deletePost(id, reason) {
	if (!id) {
		return;
	}

	fetch(`/posts/${id}?reason=${reason ?? ''}`, {
		method: 'DELETE'
	})
		.then(res => res.text())
		.then(_res => location.reload());
}
