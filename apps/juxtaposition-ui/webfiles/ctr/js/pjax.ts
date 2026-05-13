import { GET } from './xhr';

var elements: string = '';
var selectors: string[] = [];
// The page we are *currently* on.
var href: string = '';
// List of historical pages (not including current one).
var pjaxHistory: string[] = [];
var PjaxRequest = document.createEvent('Event');
var PjaxDone = document.createEvent('Event');

export type PjaxOptions = {
	elements: string;
	selectors: string[];
};

export function pjaxInit(init: PjaxOptions): void {
	elements = init.elements;
	selectors = init.selectors;
	href = document.location.pathname;

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

	GET(url, (xhr) => {
		// update history state with new page
		pjaxSetUrl(url, pushHistory);
		// parse new page in
		pjaxParseDom(xhr);
		// Delay to next tick so replaceChild can finish
		setTimeout(() => document.dispatchEvent(PjaxDone), 0);
	}, () => document.dispatchEvent(PjaxError));
}

function pjaxParseDom(xhr: XMLHttpRequest): void {
	var response = xhr.responseText;
	if (!response) {
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

export function pjaxSetUrl(url: string, pushHistory: boolean): void {
	if (pushHistory && href !== url) {
		pjaxHistory.push(href);
	}

	href = url;
	if (window.isDebugCave) {
		// for browser debugging. this doesn't work on console
		window.location.hash = url;
	}
}
