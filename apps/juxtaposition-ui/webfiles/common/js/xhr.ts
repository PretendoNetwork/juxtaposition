// CTR XHR appears to be roughly: https://www.w3.org/TR/2009/WD-XMLHttpRequest2-20090820/#the-xmlhttprequest-interface
// responseBody is missing

export type XHRCallback = (request: XMLHttpRequest) => void;

export function POSTNoTranstion(url: string, data: string, callback: XHRCallback, error?: XHRCallback): void {
	var xhttp = new XMLHttpRequest();
	xhttp.onload = function (): void {
		callback(this);
	};
	xhttp.onerror = function (): void {
		if (error) {
			error(this);
		}
	};
	xhttp.open('POST', url, true);
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhttp.send(data);
}

export function POST(url: string, data: string, callback: XHRCallback, error?: XHRCallback): void {
	loading_start();
	POSTNoTranstion(url, data, (request) => {
		loading_end();
		callback(request);
	}, (request) => {
		loading_end();
		if (error) {
			error(request);
		}
	});
}

export function GET(url: string, callback: XHRCallback, error?: XHRCallback): void {
	var xhttp = new XMLHttpRequest();
	xhttp.onload = function (): void {
		callback(this);
	};
	xhttp.onerror = function (): void {
		if (error) {
			error(this);
		}
	};
	xhttp.open('GET', url, true);
	xhttp.send();
}

export function DELETE(url: string, callback: XHRCallback, error?: XHRCallback): void {
	loading_start();
	var xhttp = new XMLHttpRequest();
	xhttp.onload = function (): void {
		loading_end();
		callback(this);
	};
	xhttp.onerror = function (): void {
		loading_end();
		if (error) {
			error(this);
		}
	};
	if (platform === 'ctr') {
		xhttp.open('POST', url, true);
		xhttp.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
	} else {
		xhttp.open('DELETE', url, true);
	}

	xhttp.send();
}

function loading_start(): void {
	if (platform === 'ctr') {
		cave.transition_begin();
	} else if (platform === 'portal') {
		wiiuBrowser.showLoadingIcon(true);
	}
}

function loading_end(): void {
	if (platform === 'ctr') {
		cave.transition_end();
	} else if (platform === 'portal') {
		wiiuBrowser.showLoadingIcon(false);
	}
}
