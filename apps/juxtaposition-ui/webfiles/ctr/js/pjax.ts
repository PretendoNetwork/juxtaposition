import { GET } from './xhr';

var elements: string = '';
var selectors: string[] = [];
var href: string = '';
export var pjaxHistory: string[] = [];
var PjaxRequest = document.createEvent('Event');
var PjaxDone = document.createEvent('Event');

export type PjaxOptions = {
	elements: string;
	selectors: string[];
};

export function pjaxInit(init: PjaxOptions): void {
	elements = init.elements;
	selectors = init.selectors;
	href = document.location.href;

	PjaxRequest.initEvent('PjaxRequest', true, true);
	PjaxDone.initEvent('PjaxDone', true, true);
}

function pjaxClick(this: HTMLElement, e: Event): boolean {
	var url = this.getAttribute('href')!;
	pjaxLoadUrl(url, true);

	e.preventDefault();
	return false;
}

export function pjaxRefresh(): void {
	var els = document.querySelectorAll(elements);

	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', pjaxClick);
	}
}

export function pjaxLoadUrl(url: string, pushHistory: boolean): void {
	document.dispatchEvent(PjaxRequest);
	GET(url, xhr => pjaxParseDom(xhr, url));

	if (pushHistory && href.indexOf(url) === -1) {
		pjaxHistory.push(href);
	}
}

function pjaxParseDom(xhr: XMLHttpRequest, url: string): void {
	var response = xhr.responseText;
	if (xhr.status !== 200 || !response) {
		return;
	}

	var html = document.implementation.createHTMLDocument('');
	html.documentElement.innerHTML = response;

	for (var i = 0; i < selectors.length; i++) {
		var newElement = html.querySelector(selectors[i]);
		var oldElement = document.querySelector(selectors[i]);
		if (!newElement || !oldElement) {
			continue;
		}

		// avoid an outerHTML roundtrip, which would serialise it all
		oldElement.parentNode?.replaceChild(document.adoptNode(newElement), oldElement);
	}

	pjaxRefresh();
	href = url;
	// Delay to next tick so replaceChild can finish
	setTimeout(() => document.dispatchEvent(PjaxDone), 0);
}

export function pjaxCanGoBack(): boolean {
	return pjaxHistory.length >= 1;
}

export function pjaxBack(): void {
	if (!pjaxCanGoBack()) {
		return;
	}
	var url = pjaxHistory.pop()!;
	pjaxLoadUrl(url, false);
}
