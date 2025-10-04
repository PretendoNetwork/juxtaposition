import crypto from 'node:crypto';
import { DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createChannel, createClient, Metadata } from 'nice-grpc';
import crc32 from 'crc/crc32';
import { FriendsDefinition } from '@pretendonetwork/grpc/friends/friends_service';
import { AccountDefinition } from '@pretendonetwork/grpc/account/account_service';
import { APIDefinition } from '@pretendonetwork/grpc/api/api_service';
import { config } from '@/config';
import { logger } from '@/logger';
import { SystemType } from '@/types/common/system-types';
import { TokenType } from '@/types/common/token-types';
import type { ObjectCannedACL } from '@aws-sdk/client-s3';
import type { FriendRequest } from '@pretendonetwork/grpc/friends/friend_request';
import type { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { GetUserDataResponse as ApiGetUserDataResponse } from '@pretendonetwork/grpc/api/get_user_data_rpc';
import type { ParsedQs } from 'qs';
import type { IncomingHttpHeaders } from 'node:http';
import type { ParamPack } from '@/types/common/param-pack';
import type { ServiceToken } from '@/types/common/service-token';

// * nice-grpc doesn't export ChannelImplementation so this can't be typed
const gRPCFriendsChannel = createChannel(`${config.grpc.friends.host}:${config.grpc.friends.port}`);
const gRPCFriendsClient = createClient(FriendsDefinition, gRPCFriendsChannel);

const gRPCAccountChannel = createChannel(`${config.grpc.account.host}:${config.grpc.account.port}`);
const gRPCAccountClient = createClient(AccountDefinition, gRPCAccountChannel);

const gRPCApiChannel = createChannel(`${config.grpc.account.host}:${config.grpc.account.port}`);
const gRPCApiClient = createClient(APIDefinition, gRPCApiChannel);

const s3 = new S3Client({
	endpoint: config.s3.endpoint,
	forcePathStyle: true,
	region: config.s3.region,
	credentials: {
		accessKeyId: config.s3.key,
		secretAccessKey: config.s3.secret
	}
});

// TODO - This doesn't really belong here
export function getInvalidPostRegex(): RegExp {
	return /[^\p{L}\p{P}\d\n\r$^¨←→↑↓√¦⇒⇔¤¢€£¥™©®+×÷=±∞˘˙¸˛˜°¹²³♭♪¬¯¼½¾♡♥●◆■▲▼☆★♀♂<> ]/gu;
}

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

export function decryptToken(token: Buffer): Buffer {
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

export async function uploadCDNAsset(key: string, data: Buffer, acl: ObjectCannedACL): Promise<boolean> {
	const awsPutParams = new PutObjectCommand({
		Body: data,
		Key: key,
		Bucket: config.s3.bucket,
		ACL: acl
	});
	try {
		await s3.send(awsPutParams);
		return true;
	} catch (e) {
		logger.error(e, 'Could not upload to CDN');
		return false;
	}
}

export async function bulkDeleteCDNAsset(keys: string[]): Promise<boolean> {
	if (keys.length === 0) {
		return true;
	}

	const awsDeleteParams = new DeleteObjectsCommand({
		Bucket: config.s3.bucket,
		Delete: {
			Objects: keys.map(v => ({
				Key: v
			})),
			Quiet: true
		}
	});
	try {
		await s3.send(awsDeleteParams);
		return true;
	} catch (e) {
		logger.error(e, 'Could not delete from CDN');
		return false;
	}
}

export async function getUserFriendPIDs(pid: number): Promise<number[]> {
	const response = await gRPCFriendsClient.getUserFriendPIDs({
		pid: pid
	}, {
		metadata: Metadata({
			'X-API-Key': config.grpc.friends.apiKey
		})
	});

	return response.pids;
}

export async function getUserFriendRequestsIncoming(pid: number): Promise<FriendRequest[]> {
	const response = await gRPCFriendsClient.getUserFriendRequestsIncoming({
		pid: pid
	}, {
		metadata: Metadata({
			'X-API-Key': config.grpc.friends.apiKey
		})
	});

	return response.friendRequests;
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

export function getUserDataFromToken(token: string): Promise<ApiGetUserDataResponse> {
	return gRPCApiClient.getUserData({}, {
		metadata: Metadata({
			'X-API-Key': config.grpc.account.apiKey,
			'X-Token': token
		})
	});
}

export function getValueFromQueryString(qs: ParsedQs, key: string): string[] {
	const property = qs[key] as string | string[];

	if (property) {
		if (Array.isArray(property)) {
			return property;
		} else {
			return [property];
		}
	}

	return [];
}

export function getValueFromHeaders(headers: IncomingHttpHeaders, key: string): string | undefined {
	let header = headers[key];
	let value: string | undefined;

	if (header) {
		if (Array.isArray(header)) {
			header = header[0];
		}

		value = header;
	}

	return value;
}
