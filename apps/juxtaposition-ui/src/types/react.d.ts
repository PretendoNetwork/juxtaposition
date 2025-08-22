declare namespace React {
	export interface DOMAttributes {
		onclick?: string; // Allow for plain attribute usage of onclick
		onClick?: never; // make react version made unusable
		onerror?: string; // Allow for plain attribute usage of onerror
		onError?: never; // make react version made unusable
	}
}
