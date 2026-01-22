export type XHRCallback = (request: XMLHttpRequest) => void;

export function POST(url: string, data: string, callback: XHRCallback): void {
	wiiuBrowser.showLoadingIcon(true);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function (): void {
		if (this.readyState === 4) {
			wiiuBrowser.showLoadingIcon(false);
			callback(this);
		}
	};
	xhttp.open('POST', url, true);
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhttp.send(data);
}

export function GET(url: string, callback: XHRCallback): void {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function (): void {
		if (this.readyState === 4) {
			callback(this);
		}
	};
	xhttp.open('GET', url, true);
	xhttp.send();
}

export function DELETE(url: string, callback: XHRCallback): void {
	wiiuBrowser.showLoadingIcon(true);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function (): void {
		if (this.readyState === 4) {
			wiiuBrowser.showLoadingIcon(false);
			callback(this);
		}
	};
	xhttp.open('GET', url, true);
	xhttp.send();
}
