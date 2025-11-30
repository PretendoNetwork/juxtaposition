/* eslint-disable @typescript-eslint/consistent-type-imports -- other methods of importing type dont work */

import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { ParamPack } from '@/types/common/param-pack';
import type { UserTokens } from '@/types/juxt/tokens';

declare global {
	namespace Express {
		type ReactElement = import('react').ReactElement;

		interface Request {
			directory?: 'ctr' | 'portal' | 'web';

			paramPackData: ParamPack | null;
			tokens: UserTokens;
			isWrite: boolean;
			guest_access: boolean;
			new_users: boolean;
			// legacy stuff
			pid: number | null;
			user: GetUserDataResponse | null;
		}

		type JsxforDirectoryOptions = Partial<Record<Request['directory'], ReactElement>> & {
			disableDoctypeFor?: Request['directory'][];
		};

		interface Response {
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
}

declare module 'express-session' {
	interface SessionData {
		tokens: UserTokens;
		// legacy stuff
		pid: number | null;
		user: GetUserDataResponse | null;
	}
}
