var Pjax = {
	elements: null,
	selectors: null,
	href: null,
	history: [],
	events: {
		PjaxRequest: document.createEvent('Event'),
		PjaxLoaded: document.createEvent('Event'),
		PjaxDone: document.createEvent('Event')
	},
	init: function (init) {
		this.elements = init.elements;
		this.selectors = init.selectors;
		this.href = document.location.href;

		this.events.PjaxRequest.initEvent('PjaxRequest', true, true);
		this.events.PjaxLoaded.initEvent('PjaxLoaded', true, true);
		this.events.PjaxDone.initEvent('PjaxDone', true, true);

		return this;
	},
	refresh: function () {
		const els = document.querySelectorAll(this.elements);
		if (!els) {
			return;
		}
		console.log(this.elements);
		console.log(els);
		for (let i = 0; i < els.length; i++) {
			els[i].addEventListener('click', function (e) {
				pageWrapper(e, this);
			});
		}
	},
	loadUrl: function (url, push) {
		if (!this.elements || !this.selectors) {
			return;
		}
		document.dispatchEvent(Pjax.events.PjaxRequest);
		this.get(url, this.parseDom);
		if (!push && Pjax.href.indexOf(url) === -1) {
			Pjax.history.push(Pjax.href);
		}
		console.log(url);
	},
	get: function (url, callback) {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState === 4) {
				document.dispatchEvent(Pjax.events.PjaxLoaded);
				this.responseURL = url;
				return callback(this);
			}
		};
		xhttp.open('GET', url, true);
		xhttp.send();
	},
	parseDom: function (data) {
		const response = data.responseText;
		if (response && data.status === 200) {
			const html = document.implementation.createHTMLDocument('');
			html.documentElement.innerHTML = response;
			for (let i = 0; i < Pjax.selectors.length; i++) {
				const newElement = html.querySelector(Pjax.selectors[i]);
				const oldElement = document.querySelector(Pjax.selectors[i]);
				if (!newElement || !oldElement) {
					continue;
				}
				oldElement.outerHTML = newElement.outerHTML;
			}
			console.log(data);
			Pjax.refresh();
			Pjax.href = data.responseURL;
			document.dispatchEvent(Pjax.events.PjaxDone);
		}
	},
	canGoBack: function () {
		return this.history.length >= 1;
	},
	back: function () {
		if (!this.canGoBack()) {
			return;
		}
		const url = this.history.pop();
		this.loadUrl(url, true);
	}
};

function pageWrapper(e, element) {
	e.preventDefault();
	Pjax.loadUrl(element.href);
	return false;
}
