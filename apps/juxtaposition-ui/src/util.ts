import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createChannel, createClient, Metadata } from 'nice-grpc';
import { AccountServiceDefinition } from '@pretendonetwork/grpc/account/v2/account_service';
import { ApiServiceDefinition } from '@pretendonetwork/grpc/api/v2/api_service';
import { DateTime } from 'luxon';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { SystemType } from '@pretendonetwork/grpc/account/v2/token_info';
import { logger } from '@/logger';
import { config } from '@/config';
import type { Options as RatelimitOptions } from 'express-rate-limit';
import type { ZodType } from 'zod';
import type { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/v2/get_user_data_rpc';
import type { GetUserDataResponse as ApiGetUserDataResponse } from '@pretendonetwork/grpc/api/v2/get_user_data_rpc';
import type { LoginResponse } from '@pretendonetwork/grpc/api/v2/login_rpc';
import type { RequestHandler } from 'express';
import type { GetPNIDResponse } from '@pretendonetwork/grpc/account/v2/get_pnid_rpc';
import type { Config } from '@/config';
import type { ParamPack } from '@/types/common/param-pack';

const gRPCAccountChannel = createChannel(`${config.grpc.account.host}:${config.grpc.account.port}`);
const gRPCAccountClient = createClient(AccountServiceDefinition, gRPCAccountChannel);

const gRPCApiChannel = createChannel(`${config.grpc.account.host}:${config.grpc.account.port}`);
const gRPCApiClient = createClient(ApiServiceDefinition, gRPCApiChannel);

export function decodeParamPack(paramPack: string): ParamPack {
	const values = Buffer.from(paramPack, 'base64').toString().split('\\').filter(v => v.length > 0).values();
	const entries: Record<string, string> = {};
	for (let i = 0; i < 16; i++) { /* Enforce an upper limit on ParamPack decoding */
		// Keys and values are sibling list entries
		const paramKey = values.next().value;
		const paramVal = values.next().value;
		// We hit the end of the list
		if (paramKey === undefined || paramVal === undefined) {
			break;
		}

		entries[paramKey] = paramVal;
	}

	// normalize and prevent any funny businiess from clients
	// one day this can be a proper DTO
	return {
		title_id: entries.title_id ?? '',
		access_key: entries.access_key ?? '',
		platform_id: entries.platform_id ?? '',
		region_id: entries.region_id ?? '',
		language_id: entries.language_id ?? '',
		country_id: entries.country_id ?? '',
		area_id: entries.area_id ?? '',
		network_restriction: entries.network_restriction ?? '',
		friend_restriction: entries.friend_restriction ?? '',
		rating_restriction: entries.rating_restriction ?? '',
		rating_organization: entries.rating_organization ?? '',
		transferable_id: entries.transferable_id ?? '',
		tz_name: entries.tz_name ?? '',
		utc_offset: entries.utc_offset ?? ''
	};
}

export async function getUserDataFromServiceToken(token: string): Promise<GetPNIDResponse | null> {
	try {
		const userData = await gRPCAccountClient.exchangeIndependentServiceTokenForUserData({
			token
		});

		const unpackedToken = userData.tokenInfo;
		if (!unpackedToken) {
			throw new Error('No tokenInfo on service token');
		}
		if (!unpackedToken.issueTime) {
			throw new Error('No issueTime on service token');
		}

		// * Only allow CTR and WUP tokens
		if (![SystemType.SYSTEM_TYPE_CTR, SystemType.SYSTEM_TYPE_WUP].includes(unpackedToken.systemType)) {
			return null;
		}

		// * Check if the token is expired
		const expiryTime = 24 * 60 * 60 * 1000; // 24 hours
		if (new Date(unpackedToken.issueTime.getTime() + expiryTime) < new Date()) {
			return null;
		}

		if (!userData.pnid) {
			return null;
		}

		return userData.pnid;
	} catch (e) {
		logger.error(e, 'Failed to extract PID from service token');
		return null;
	}
}

export function getReasonMap(): string[] {
	return [
		'Spoiler',
		'Personal Information',
		'Violent Content',
		'Inappropriate/Harmful Conduct',
		'Hateful/Bullying',
		'Advertising',
		'Sexually Explicit',
		'Piracy',
		'Inappropriate Behavior in Game',
		'Other',
		'Missing Images; Reach out to Jemma with post link to fix',
		'Mean/Rude/Hateful (Rule 1)',
		'Inappropriate/NSFW (Rule 2)',
		'Spam/Self-Promotion (Rule 3)',
		'Off-Topic (Rule 4)',
		'Piracy (Rule 5)',
		'API Abuse/Exploiting Bugs (Rule 8)',
		'Drama (Rule 9)',
		'Cheating Online (Rule 10)',
		'Spoiler (Rule 11)',
		'Personal Information (Rule 12)',
		'Politics (Rule 13)',
		'Misinformation/Bad Advice (Rule 14)',
		'Impersonation (Rule 15)'
	];
}

export async function getUserAccountData(pid: number): Promise<AccountGetUserDataResponse> {
	const result: AccountGetUserDataResponse = await gRPCAccountClient.getPNID({
		pid: pid
	}, {
		metadata: Metadata({
			'X-API-Key': config.grpc.account.apiKey
		})
	});
	return result;
}

export async function getUserDataFromToken(token: string): Promise<ApiGetUserDataResponse> {
	return gRPCApiClient.getUserData({}, {
		metadata: Metadata({
			'X-API-Key': config.grpc.account.apiKey,
			'X-Token': token
		})
	});
}

export async function passwordLogin(username: string, password: string): Promise<LoginResponse> {
	return await gRPCApiClient.login({
		username: username,
		password: password,
		grantType: 'password'
	}, {
		metadata: Metadata({
			'X-API-Key': config.grpc.account.apiKey
		})
	});
}

/* Unused until refresh token auth is implemented */
// export async function refreshLogin(refreshToken: string): Promise<LoginResponse> {
// 	return await gRPCApiClient.login({
// 		refreshToken: refreshToken
// 	}, {
// 		metadata: Metadata({
// 			'X-API-Key': config.grpc.account.apiKey
// 		})
// 	});
// }

export function fixupUnicodes(input: string): string {
	// 202F NARROW NON BREAKING SPACE
	// -> normal NBSP (Cemu doesn't render NNBSP right)
	input = input.replaceAll('\u202F', '\u00A0');

	return input;
}

function makeDateObject(date: Date | DateTime | string): DateTime {
	if (date instanceof Date) {
		date = DateTime.fromJSDate(date);
	} else if (typeof date === 'string') {
		date = DateTime.fromISO(date);
	}

	return date;
}

export function humanDate(date?: Date | DateTime | string | null): string {
	if (!date) {
		return 'null';
	}
	date = makeDateObject(date);

	const dateString = date.toUTC().toLocaleString(DateTime.DATETIME_MED) + ' UTC';
	return fixupUnicodes(dateString);
}

export function humanFromNow(date?: Date | DateTime | string | null): string {
	if (!date) {
		return 'unknown time';
	}
	date = makeDateObject(date);

	const durationString = date.toRelative({
		rounding: 'expand'
	});
	return durationString ?? 'unknown time';
}

const filename = fileURLToPath(import.meta.url);
// The root of the dist/ folder.
export const distFolder = path.dirname(filename);
export const langsFolder = path.join(distFolder, 'assets/locales');

export function zodFallback<T>(value: T): ZodType<T> {
	return z.any().transform(() => value);
}

export function createRatelimit(key: keyof Config['ratelimit'], ops: Partial<RatelimitOptions>): RequestHandler {
	const rate = rateLimit(ops);
	return (req, res, next) => {
		if (config.ratelimit[key] === true) {
			return rate(req, res, next);
		}
		return next();
	};
}
