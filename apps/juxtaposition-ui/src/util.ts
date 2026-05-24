import crypto from 'crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createChannel, createClient, Metadata } from 'nice-grpc';
import { AccountDefinition } from '@pretendonetwork/grpc/account/account_service';
import { APIDefinition } from '@pretendonetwork/grpc/api/api_service';
import crc32 from 'crc/crc32';
import { DateTime } from 'luxon';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { logger } from '@/logger';
import { config } from '@/config';
import { SystemType } from '@/types/common/system-types';
import { TokenType } from '@/types/common/token-types';
import type { Options as RatelimitOptions } from 'express-rate-limit';
import type { ZodType } from 'zod';
import type { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { GetUserDataResponse as ApiGetUserDataResponse } from '@pretendonetwork/grpc/api/get_user_data_rpc';
import type { LoginResponse } from '@pretendonetwork/grpc/api/login_rpc';
import type { RequestHandler } from 'express';
import type { Config } from '@/config';
import type { ServiceToken } from '@/types/common/service-token';
import type { ParamPack } from '@/types/common/param-pack';

const gRPCAccountChannel = createChannel(`${config.grpc.account.host}:${config.grpc.account.port}`);
const gRPCAccountClient = createClient(AccountDefinition, gRPCAccountChannel);

const gRPCApiChannel = createChannel(`${config.grpc.account.host}:${config.grpc.account.port}`);
const gRPCApiClient = createClient(APIDefinition, gRPCApiChannel);

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

export function getPIDFromServiceToken(token: string): number | null {
	try {
		const decryptedToken = decryptToken(Buffer.from(token, 'base64'));

		if (!decryptedToken) {
			return null;
		}

		const unpackedToken = unpackServiceToken(decryptedToken);
		if (unpackedToken === null) {
			return null;
		}

		// * Only allow token types 1 (Wii U) and 2 (3DS)
		if (unpackedToken.system_type !== SystemType.CTR && unpackedToken.system_type !== SystemType.WUP) {
			return null;
		}

		// * Check if the token is expired
		if (unpackedToken.issue_time + (24n * 3600n * 1000n) < Date.now()) {
			return null;
		}

		return unpackedToken.pid;
	} catch (e) {
		logger.error(e, 'Failed to extract PID from service token');
		return null;
	}
}

function decryptToken(token: Buffer): Buffer {
	const iv = Buffer.alloc(16);

	const expectedChecksum = token.readUint32BE();
	const encryptedBody = token.subarray(4);

	const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(config.aesKey, 'hex'), iv);

	const decrypted = Buffer.concat([
		decipher.update(encryptedBody),
		decipher.final()
	]);

	if (expectedChecksum !== crc32(decrypted)) {
		throw new Error('Checksum did not match. Failed decrypt. Are you using the right key?');
	}

	return decrypted;
}

export function unpackServiceToken(token: Buffer): ServiceToken | null {
	const token_type = token.readUInt8(0x1);
	if (token_type !== TokenType.IndependentService) {
		return null;
	}

	return {
		system_type: token.readUInt8(0x0),
		token_type: token.readUInt8(0x1),
		pid: token.readUInt32LE(0x2),
		issue_time: token.readBigUInt64LE(0x6),
		title_id: token.readBigUInt64LE(0xE),
		access_level: token.readInt8(0x16)
	};
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
		'Missing Images; Reach out to Jemma with post link to fix'
	];
}

export function getUserAccountData(pid: number): Promise<AccountGetUserDataResponse> {
	return gRPCAccountClient.getUserData({
		pid: pid
	}, {
		metadata: Metadata({
			'X-API-Key': config.grpc.account.apiKey
		})
	});
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
