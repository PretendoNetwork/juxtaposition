import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';

export class InternalAPIError extends Error {
	status: number;
	code: string;
	reason: string | undefined;

	constructor(code: string, status: number, reason?: string) {
		super(`Internal API returned with ${status}:${code}`);
		this.status = status;
		this.code = code;
		this.reason = reason;
	}
}

/**
 * If the error needs to handled programatically, create/use a specific error code
 * If the error is only for developers and not programs, use a generic code with a reason string
 */
const errorCodes = {
	// Generic codes
	not_found: 404,
	bad_request: 400,
	server_error: 500,
	forbidden: 403,
	unauthorized: 401,
	requires_auth: 401,

	// Specific codes
	auth_account_deleted: 401,
	auth_account_juxt_banned: 403,
	auth_account_network_banned: 403,
	auth_onboarding_incomplete: 403,
	user_deleted: 404,
	user_banned: 404
} as const;
const errorCodeKeys = Object.keys(errorCodes) as [keyof typeof errorCodes, ...Array<keyof typeof errorCodes>];

export const errorCodesSchema = asOpenapi('ErrorCodes', z.enum(errorCodeKeys)); // Registerd to OpenAPI
export type InternalApiErrorCodes = z.infer<typeof errorCodesSchema>;

function errorBuilder() {
	return {
		for(code: InternalApiErrorCodes, reason?: string) {
			const status = errorCodes[code];
			return new InternalAPIError(code, status, reason);
		}
	};
}

export const errors = errorBuilder();
