declare namespace React {
	export interface DOMAttributes {
		'evt-click'?: string; // alias for the plain attribute onclick
		'onClick'?: never; // make react version made unusable

		'evt-error'?: string; // alias for the plain attribute onerror
		'onError'?: never; // make react version made unusable

		'evt-change'?: string; // alias for the plain attribute onchange
		'onChange'?: never; // make react version made unusable

		'evt-load'?: string; // alias for the plain attribute onload
		'onLoad'?: never; // make react version made unusable
	}
}
