// Script for the post page view (postPageView.tsx)
import { deletePostById, empathyPostById } from './api';
import { classList } from './util';

function deletePost(this: HTMLElement, _e: Event): void {
	var id = this.getAttribute('data-button-delete-post');
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

	deletePostById(id, null, function (response) {
		if (response.status !== 200) {
			return cave.error_callFreeErrorViewer(
				5980030,
				`Post was not able to be deleted. Please try again later. (${response.status})`
			);
		}

		alert('Post has been deleted.');
		window.location.href = response.nextUrl;
	});
}

function initDeleteButton(): void {
	var del = document.querySelector('[data-button-delete-post]');
	if (!del) {
		return;
	}

	(del as HTMLElement).addEventListener('click', deletePost);
}

function inc(base: string, val: number): string {
	return (Number(base) + val).toString();
}

function yeahPost(this: HTMLInputElement, _e: Event): void {
	var sprite = this.querySelector('.sprite.sp-yeah')!;
	var id = this.getAttribute('data-button-yeah-post')!;
	var count = document.getElementById('count-' + id)!;
	this.disabled = true;

	if (classList.toggle(sprite, 'selected')) {
		count.innerText = inc(count.innerText, 1);
		// @ts-expect-error incorrect upstream types for SE label
		cave.snd_playSe('SE_OLV_MII_ADD');
	} else {
		count.innerText = inc(count.innerText, -1);
		// @ts-expect-error incorrect upstream types for SE label
		cave.snd_playSe('SE_OLV_CANCEL');
	}

	empathyPostById(id, (post) => {
		if (post.status !== 200) {
			// Apparently there was an actual error code for not being able to yeah a post, who knew!
			// TODO: Find more of these
			return cave.error_callErrorViewer(155927);
		}
		this.disabled = false;
		if (count) {
			count.innerText = post.count.toString();
		}
	});
}

/* NOTE exported temporarily until we have a longer-term solution to hydrating PJAX docs */
export function initYeahButton(posts: Element | Document | DocumentFragment): void {
	var els = posts.querySelectorAll('button[data-button-yeah-post]') as NodeListOf<HTMLInputElement>;
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', yeahPost);
	}
}

export function initPostPageView(): void {
	initDeleteButton();
	// initYeahButton(document);
}
