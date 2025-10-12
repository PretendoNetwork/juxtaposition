/* eslint-disable @typescript-eslint/consistent-type-imports -- other methods of importing type dont work */

import type { UserTokens } from '@/fetch';
import type { ParamPack } from '@/types/common/param-pack';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { AccountData } from '@/types/common/account-data';

declare global {
	namespace Express {
		type ReactElement = import('react').ReactElement;

		interface Locals {
			/** The account data of the requesting user, or null if guest. */
			account: AccountData | null;
		}

		interface Request {
			directory?: 'ctr' | 'portal' | 'web';

			paramPackData: ParamPack | null;
			tokens: UserTokens;
			isWrite: boolean;
			/** Whether this Juxt instance allows guest access */
			guest_access: boolean;
			/** Whether this Juxt instance is open for registration */
			new_users: boolean;
			// legacy stuff - please use locals.account
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
		pnid: GetUserDataResponse | null;
	}
}
