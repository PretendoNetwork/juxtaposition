import { empathyPostById } from './api';

function inc(base: string, val: number): string {
	return (Number(base) + val).toString();
}
/* It would be really nice to use <button> here to get disabling and other functionality for free.
 * Unfortunately there's a lot of CSS nonsense tied up in <button>, which comes back to component
 * libraries.. So for now we use span and emulate things with dataset. Yuck.
 */
function yeahPost(this: HTMLSpanElement, _e: Event): void {
	if (this.dataset.disabled === '1') {
		return;
	}

	const id = this.getAttribute('data-button-yeah-post')!;
	const count = document.getElementById('count-' + id)!;
	this.dataset.disabled = '1';

	if (this.classList.toggle('selected')) {
		count.innerText = inc(count.innerText, 1);
	} else {
		count.innerText = inc(count.innerText, -1);
	}

	empathyPostById(id, (post) => {
		if (post.status !== 200) {
			// Apparently there was an actual error code for not being able to yeah a post, who knew!
			// TODO: Find more of these
			return Toast('You cannot give this post a Yeah!');
		}
		this.dataset.disabled = '0';
		if (count) {
			count.innerText = post.count.toString();
		}
	});
}

/* NOTE exported temporarily until we have a longer-term solution to hydrating PJAX docs */
export function initYeahButton(posts: Element | Document | DocumentFragment): void {
	const els = posts.querySelectorAll('span[data-button-yeah-post]') as NodeListOf<HTMLSpanElement>;
	for (let i = 0; i < els.length; i++) {
		els[i].addEventListener('click', yeahPost);
	}
}
