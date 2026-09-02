export function initLocalStorage(): void {

}

export function localStorageSet(key: string, value: any): void {
	var blob = JSON.stringify(value);

	if (platform === 'ctr') {
		cave.lls_setItem(key, blob);
	} else if (platform === 'portal') {
		wiiuLocalStorage.setItem(key, blob);
		wiiuLocalStorage.write();
	} else {
		localStorage.setItem(key, blob);
	}
}

export function localStorageGet(key: string): any | null {
	var blob: string | null;
	if (platform === 'ctr') {
		blob = cave.lls_getItem(key);
	} else if (platform === 'portal') {
		blob = wiiuLocalStorage.getItem(key);
	} else {
		blob = localStorage.getItem(key);
	}

	if (blob === '' || blob === null) {
		return null;
	}

	try {
		return JSON.parse(blob);
	} catch (ignored) {
		return null;
	}
}

export function localStorageDelete(key: string): void {
	if (platform === 'ctr') {
		cave.lls_removeItem(key);
	} else if (platform === 'portal') {
		wiiuLocalStorage.removeItem(key);
	} else {
		localStorage.removeItem(key);
	}
}

export function initSessionStorage(): void {
	if (platform === 'ctr') {
		// LS actually is a proper LocalStorage on cave. Emulate session storage by wiping it on
		// startup.
		if (cave.history_getBackCount() === 0) {
			cave.ls_clear();
		}
	}
}

export function sessionStorageSet(key: string, value: any): void {
	var blob = JSON.stringify(value);

	if (platform === 'ctr') {
		cave.ls_setItem(key, blob);
	} else if (platform === 'portal') {
		wiiuSessionStorage.setItem(key, blob);
	} else {
		sessionStorage.setItem(key, blob);
	}
}

export function sessionStorageGet(key: string): any | null {
	var blob: string | null;
	if (platform === 'ctr') {
		blob = cave.ls_getItem(key);
	} else if (platform === 'portal') {
		blob = wiiuSessionStorage.getItem(key);
	} else {
		blob = sessionStorage.getItem(key);
	}

	if (blob === '' || blob === null) {
		return null;
	}

	try {
		return JSON.parse(blob);
	} catch (ignored) {
		return null;
	}
}

export function sessionStorageDelete(key: string): void {
	if (platform === 'ctr') {
		cave.ls_removeItem(key);
	} else if (platform === 'portal') {
		wiiuSessionStorage.removeItem(key);
	} else {
		sessionStorage.removeItem(key);
	}
}
