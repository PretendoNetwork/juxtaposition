import { POST, DELETE } from './xhr';

export type EmpathyPostResponse = {
	status: number;
	id: string;
	count: number;
};

export function empathyPostById(id: string, cb: (post: EmpathyPostResponse) => void): void {
	const params = 'postID=' + id;

	POST('/posts/empathy', params, (xhr) => {
		if (xhr.status !== 200) {
			return cb({ status: xhr.status, id, count: 0 });
		}
		let post: EmpathyPostResponse;

		try {
			post = JSON.parse(xhr.responseText);
		} catch (e) {
			console.error(e);
			return cb({ status: 400, id, count: 0 });
		}

		cb(post);
	});
}

export type DeletePostResponse = {
	status: number;
	nextUrl: string;
};

export function deletePostById(id: string, reason: string | null, cb: (result: DeletePostResponse) => void): void {
	const postUrl = `/posts/${id}`;
	const query = reason !== null ? `?reason=${encodeURIComponent(reason)}` : '';

	DELETE(postUrl + query, function (xhr) {
		if (xhr.status !== 200) {
			return cb({ status: xhr.status, nextUrl: postUrl });
		}

		// HACK: we haven't actually formalised this API serverside yet
		// for now, synthesise the response object ourselves
		// make sure it looks like a URL...
		const nextUrl = xhr.responseText;
		if (!/^\/[\w/]+$/.test(nextUrl)) {
			return cb({ status: 400, nextUrl: postUrl });
		}

		// make a response object
		return cb({ status: 200, nextUrl });
	});
}

export type UnspoilerPostResponse = {
	success: boolean;
};

export function unspoilerPostById(id: string, cb: () => void): void {
	POST(`/posts/${id}/edit/unspoiler`, '', (xhr) => {
		if (xhr.status !== 200) {
			return cb();
		}
		let res: UnspoilerPostResponse;

		try {
			res = JSON.parse(xhr.responseText);
		} catch (e) {
			console.error(e);
			return cb();
		}

		if (!res.success) {
			return cb();
		}

		cb();
	});
}

export type SpoilerPostResponse = {
	success: boolean;
};

export function spoilerPostById(id: string, cb: () => void): void {
	POST(`/posts/${id}/edit/spoiler`, '', (xhr) => {
		if (xhr.status !== 200) {
			return cb();
		}
		let res: SpoilerPostResponse;

		try {
			res = JSON.parse(xhr.responseText);
		} catch (e) {
			console.error(e);
			return cb();
		}

		if (!res.success) {
			return cb();
		}

		cb();
	});
}
