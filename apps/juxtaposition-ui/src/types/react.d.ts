declare namespace React {
	export interface DOMAttributes {
		onclick?: string; // Allow for plain attribute usage of onclick
		onClick?: never; // make react version made unusable
	}
}
