/* eslint-disable @typescript-eslint/consistent-type-imports -- other methods of importing type dont work */

declare namespace Express {
	type ReactElement = import('react').ReactElement;

	export interface Request {
		directory?: 'ctr' | 'portal' | 'web';
	}

	export type JsxforDirectoryOptions = Partial<Record<Request['directory'], ReactElement>> & {
		disableDoctypeFor?: Request['directory'][];
	};

	export interface Response {
		/**
		 * Render JSX as static markup. Only static! No state or event handlers are supported.
		 */
		jsx: (el: ReactElement, addDoctype?: boolean) => Response;

		/**
		 * Render JSX for directory set on req.directory as static markup. Only static! No state or event handlers are supported.
		 */
		jsxForDirectory: (el: JsxforDirectoryOptions) => Response;
	}
}
