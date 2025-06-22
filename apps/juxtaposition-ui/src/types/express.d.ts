declare namespace Express {
	export interface Request {
		directory?: 'ctr' | 'portal' | 'web';
	}

	export interface Response {
		/**
		 * Render JSX as static markup. Only static! No state or event handlers are supported.
		 */
		jsx: (el: ReactElement) => Response;

		/**
		 * Render JSX for directory set on req.directory as static markup. Only static! No state or event handlers are supported.
		 */
		jsxForDirectory: (el: Record<Request['directory'], ReactElement?>) => Response;
	}
}
