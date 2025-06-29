/* eslint-disable no-var -- let/const no worky */

function error(msg: string): void {
	return console.error(msg);
}

function selector(me: Element, param_name: string): Element | null {
	var sel = me.getAttribute(param_name);
	if (sel === null) {
		return null;
	}

	return document.querySelector(sel);
}

function addReqParam(url: string): string {
	var queryStart = url.indexOf('?');
	if (queryStart >= 0) {
		var baseurl = url.slice(0, queryStart);
		var params = new URLSearchParams(url.slice(queryStart));
		params.append('h-req', 'true');

		return `${baseurl}?${params.toString()}`;
	} else {
		var params = new URLSearchParams({ 'h-req': 'true' });
		return `${url}?${params.toString()}`;
	}
}

function GET(url: string, onload: (x: XMLHttpRequest) => void): void {
	var newUrl = addReqParam(url);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function (): void {
		if (this.readyState === 4) {
			return onload(this);
		}
	};
	xhttp.open('GET', newUrl, true);
	xhttp.send();
}

function wrap(handler: (me: Element) => void): (ev: Event) => void {
	return (ev: Event): void => {
		if (!(ev.currentTarget instanceof Element)) {
			return;
		}
		handler(ev.currentTarget);
	};
}

export type JTMXSettings = {

};

export function jtmxInit(root?: Element): void {
	root = root ?? document.documentElement;

	var actions = {
		get: wrap(function (me: Element): void {
			var url = me.getAttribute('h-get');
			var target = selector(me, 'h-target');
			if (url === null || target === null) {
				error('Missing h-target!');
				return;
			}

			GET(url, function onload(req: XMLHttpRequest): void {
				target!.innerHTML = req.response;
				jtmxInit(target!);
			});
			console.debug('GET');
		}),
		post: wrap(function (me: Element): void {
			var target = selector(me, 'h-target');
			if (target === null) {
				error('Missing h-target!');
				return;
			}

			// todo
			console.debug('POST');
		})
	};

	for (var _action in actions) {
		var action = _action as keyof typeof actions; // holy fuck
		var handler = actions[action];

		var elems = root.querySelectorAll(`[h-${action}]`);
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i];

			// todo forms use submit here
			var trigger = elem.getAttribute('h-trigger') ?? 'click';

			elem.addEventListener(trigger, handler);
		}
	}
}
