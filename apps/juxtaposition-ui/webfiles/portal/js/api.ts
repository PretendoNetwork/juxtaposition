import { POST, DELETE } from './xhr';

export type EmpathyPostResponse = {
	status: number;
	id: string;
	count: number;
};

export function empathyPostById(id: string, cb: (post: EmpathyPostResponse) => void): void {
	var params = 'postID=' + id;

	POST('/posts/empathy', params, (xhr) => {
		if (xhr.status !== 200) {
			return cb({ status: xhr.status, id, count: 0 });
		}
		var post: EmpathyPostResponse;

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

export function deletePostById(id: string, cb: (result: DeletePostResponse) => void): void {
	var postUrl = `/posts/${id}`;

	DELETE(postUrl, function (xhr) {
		if (xhr.status !== 200) {
			return cb({ status: xhr.status, nextUrl: postUrl });
		}

		// HACK: we haven't actually formalised this API serverside yet
		// for now, synthesise the response object ourselves
		// make sure it looks like a URL...
		var nextUrl = xhr.responseText;
		if (!/^\/[\w/]+$/.test(nextUrl)) {
			return cb({ status: 400, nextUrl: postUrl });
		}

		// make a response object
		return cb({ status: 200, nextUrl });
	});
}
