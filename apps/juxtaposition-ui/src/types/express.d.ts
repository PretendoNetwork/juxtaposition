declare namespace Express {
	export interface Response {
		/**
		 * Render JSX as static markup. Only static! No state or event handlers are supported.
		 */
		jsx: (el: ReactElement) => Response;
	}
}
