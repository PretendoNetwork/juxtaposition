export async function deletePost(id, reason) {
	if (!id) {
		return;
	}

	const params = new URLSearchParams({ reason });

	await fetch(`/posts/${id}?${params}`, { method: 'DELETE' });
	location.reload();
}
