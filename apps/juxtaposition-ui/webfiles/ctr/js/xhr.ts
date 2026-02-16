// CTR XHR appears to be roughly: https://www.w3.org/TR/2009/WD-XMLHttpRequest2-20090820/#the-xmlhttprequest-interface
// responseBody is missing

export type XHRCallback = (request: XMLHttpRequest) => void;

export function POSTNoTranstion(url: string, data: string, callback: XHRCallback): void {
	var xhttp = new XMLHttpRequest();
	xhttp.onload = function (): void {
		callback(this);
	};
	xhttp.open('POST', url, true);
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhttp.send(data);
}

export function POST(url: string, data: string, callback: XHRCallback): void {
	cave.transition_begin();
	POSTNoTranstion(url, data, (request) => {
		cave.transition_end();
		callback(request);
	});
}

export function GET(url: string, callback: XHRCallback): void {
	var xhttp = new XMLHttpRequest();
	xhttp.onload = function (): void {
		callback(this);
	};
	xhttp.open('GET', url, true);
	xhttp.send();
}

export function DELETE(url: string, callback: XHRCallback): void {
	cave.transition_begin();
	var xhttp = new XMLHttpRequest();
	xhttp.onload = function (): void {
		cave.transition_end();
		callback(this);
	};
	xhttp.open('POST', url, true);
	xhttp.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
	xhttp.send();
}
