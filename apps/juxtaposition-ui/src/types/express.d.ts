/* eslint-disable @typescript-eslint/consistent-type-imports -- other methods of importing type dont work */

declare namespace Express {
	export interface Request {
		directory?: 'ctr' | 'portal' | 'web';
	}

	export type JsxforDirectoryOptions = Partial<Record<Request['directory'], import('react').ReactElement>> & {
		disableDoctypeFor?: Request['directory'][];
	};

	export interface Response {
		/**
		 * Render JSX as static markup. Only static! No state or event handlers are supported.
		 */
		jsx: (el: import('react').ReactElement, addDoctype?: boolean = true) => Response;

		/**
		 * Render JSX for directory set on req.directory as static markup. Only static! No state or event handlers are supported.
		 */
		jsxForDirectory: (el: JsxforDirectoryOptions) => Response;
	}
}
