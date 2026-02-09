var elements: string = '';
var selectors: string[] = [];
var href: string = '';
export var pjaxHistory: string[] = [];
var events = {
	PjaxRequest: document.createEvent('Event'),
	PjaxLoaded: document.createEvent('Event'),
	PjaxDone: document.createEvent('Event')
};

export type PjaxOptions = {
	elements: string;
	selectors: string[];
};

export function pjaxInit(init: PjaxOptions): void {
	elements = init.elements;
	selectors = init.selectors;
	href = document.location.href;

	events.PjaxRequest.initEvent('PjaxRequest', true, true);
	events.PjaxLoaded.initEvent('PjaxLoaded', true, true);
	events.PjaxDone.initEvent('PjaxDone', true, true);
}

export function pjaxRefresh(): void {
	var els = document.querySelectorAll(elements);
	if (!els) {
		return;
	}
	// console.log(this.elements);
	// console.log(els);
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			pageWrapper(e);
		});
	}
}

export function pjaxLoadUrl(url: string, pushHistory: boolean): void {
	if (!elements || !selectors) {
		return;
	}
	document.dispatchEvent(events.PjaxRequest);
	pjaxGet(url, pjaxParseDom);
	if (pushHistory && href.indexOf(url) === -1) {
		pjaxHistory.push(href);
	}
}

export function pjaxGet(url: string, callback: (xhr: XMLHttpRequest, url: string) => void): void {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function (): void {
		if (this.readyState === 4) {
			document.dispatchEvent(events.PjaxLoaded);
			return callback(this, url);
		}
	};
	xhttp.open('GET', url, true);
	xhttp.send();
}

export function pjaxParseDom(data: XMLHttpRequest, url: string): void {
	var response = data.responseText;
	if (response && data.status === 200) {
		var html = document.implementation.createHTMLDocument('');
		html.documentElement.innerHTML = response;
		for (var i = 0; i < selectors.length; i++) {
			var newElement = html.querySelector(selectors[i]);
			var oldElement = document.querySelector(selectors[i]);
			if (!newElement || !oldElement) {
				continue;
			}
			oldElement.outerHTML = newElement.outerHTML;
		}
		// console.log(data);
		pjaxRefresh();
		href = url;
		document.dispatchEvent(events.PjaxDone);
	}
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

function pageWrapper(e: Event): boolean {
	var me = e.currentTarget as HTMLAnchorElement;
	e.preventDefault();
	pjaxLoadUrl(me.href, true);
	return false;
}
