import crypto from 'crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createChannel, createClient, Metadata } from 'nice-grpc';
import { AccountDefinition } from '@pretendonetwork/grpc/account/account_service';
import { FriendsDefinition } from '@pretendonetwork/grpc/friends/friends_service';
import { APIDefinition } from '@pretendonetwork/grpc/api/api_service';
import HashMap from 'hashmap';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crc32 from 'crc/crc32';
import { database } from '@/database';
import { COMMUNITY } from '@/models/communities';
import { NOTIFICATION } from '@/models/notifications';
import { logger } from '@/logger';
import { CONTENT } from '@/models/content';
import { SETTINGS } from '@/models/settings';
import { LOGS } from '@/models/logs';
import { config } from '@/config';
import { SystemType } from '@/types/common/system-types';
import { TokenType } from '@/types/common/token-types';
import { translations } from '@/translations';
import type { ObjectCannedACL } from '@aws-sdk/client-s3';
import type { NotificationSchema } from '@/models/notifications';
import type { CommunitySchema } from '@/models/communities';
import type { ParamPack } from '@/types/common/param-pack';
import type { ServiceToken } from '@/types/common/service-token';
import type { InferSchemaType } from 'mongoose';
import type { Notification } from '@/types/juxt/notification';
import type { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { GetUserDataResponse as ApiGetUserDataResponse } from '@pretendonetwork/grpc/api/get_user_data_rpc';
import type { FriendRequest } from '@pretendonetwork/grpc/friends/friend_request';
import type { LoginResponse } from '@pretendonetwork/grpc/api/login_rpc';

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

const communityMap = new HashMap<string, string>();
const userMap = new HashMap<number, string>();

/**
 * Map from {olive_community_id, title_id} to name
 * and also title_id + '-id' to olive_community_id
 */
export function getCommunityHash(): HashMap<string, string> {
	return communityMap;
}
/**
 * Map from pid to screen_name (transformed)
 */
export function getUserHash(): HashMap<number, string> {
	return userMap;
}

refreshCache();

function refreshCache(): void {
	database.connect().then(async () => {
		for await (const community of COMMUNITY.find()) {
			updateCommunityHash(community);
		}
		logger.success('Created community index');

		const users = await database.getUsersSettings(-1);

		for (const user of users) {
			if (user.pid === undefined || user.screen_name === undefined) {
				continue;
			}

			setName(user.pid, user.screen_name);
		}
		logger.success('Created user index of ' + users.length + ' users');
	}).catch((error) => {
		logger.error(error);
	});
}

/**
 * Updates a user's name in the user map.
 */
export function setName(pid: number, name: string): void {
	userMap.set(pid, name.replace(/[\u{0080}-\u{FFFF}]/gu, '').replace(/\u202e/g, ''));
}

/**
 * Updates a community's info in the map.
 */
export function updateCommunityHash(community: InferSchemaType<typeof CommunitySchema>): void {
	if (community.title_id === undefined ||
		community.olive_community_id === undefined ||
		community.name === undefined
	) {
		return;
	}

	for (const title_id of community.title_id) {
		communityMap.set(title_id, community.name);
		communityMap.set(title_id + '-id', community.olive_community_id);
	}
	communityMap.set(community.olive_community_id, community.name);
}

// TODO - This doesn't belong here, just hacking it in. Gonna redo this whole server anyway so fuck it
export function getInvalidPostRegex(): RegExp {
	return /[^\p{L}\p{P}\d\n\r$^¨←→↑↓√¦⇒⇔¤¢€£¥™©®+×÷=±∞˘˙¸˛˜°¹²³♭♪¬¯¼½¾♡♥●◆■▲▼☆★♀♂<> ]/gu;
}

export async function createUser(pid: number, experience: number, notifications: boolean): Promise<void> {
	const pnid = await getUserAccountData(pid);
	if (!pnid) {
		return;
	}

	const name = pnid.mii?.name ?? 'Default';

	const newSettings = {
		pid: pid,
		screen_name: name,
		game_skill: experience,
		receive_notifications: notifications
	};
	const newContent = {
		pid: pid
	};
	const newSettingsObj = new SETTINGS(newSettings);
	await newSettingsObj.save();

	const newContentObj = new CONTENT(newContent);
	await newContentObj.save();

	setName(pid, name);
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

export function processLanguage(paramPack?: ParamPack): typeof translations.EN {
	if (!paramPack) {
		return translations.EN;
	}
	const languageIdMap: Record<string, keyof typeof translations> = {
		0: 'JA',
		1: 'EN',
		2: 'FR',
		3: 'DE',
		4: 'IT',
		5: 'ES',
		6: 'ZH',
		7: 'KO',
		8: 'NL',
		9: 'PT',
		10: 'RU',
		11: 'ZH'
	};

	const language = languageIdMap[paramPack.language_id] ?? 'EN';
	return translations[language];
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

export async function newNotification(notification: Notification): Promise<InferSchemaType<typeof NotificationSchema> | null> {
	const now = new Date();
	if (notification.type === 'follow') {
		// { pid: userToFollowContent.pid, type: "follow", objectID: req.pid, link: `/users/${req.pid}` }
		let existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, objectID: notification.objectID });
		if (existingNotification) {
			existingNotification.lastUpdated = now;
			existingNotification.read = false;
			return existingNotification.save();
		}
		const last60min = new Date(now.getTime() - 60 * 60 * 1000);
		existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, type: 'follow', lastUpdated: { $gte: last60min } });
		if (existingNotification) {
			existingNotification.users.push({
				user: notification.objectID,
				timestamp: now
			});
			existingNotification.lastUpdated = now;
			existingNotification.link = notification.link;
			existingNotification.objectID = notification.objectID;
			existingNotification.read = false;
			return existingNotification.save();
		} else {
			const newNotification = new NOTIFICATION({
				pid: notification.pid,
				type: notification.type,
				users: [{
					user: notification.objectID,
					timestamp: now
				}],
				link: notification.link,
				objectID: notification.objectID,
				read: false,
				lastUpdated: now
			});
			return newNotification.save();
		}
	} else if (notification.type == 'notice') {
		const newNotification = new NOTIFICATION({
			pid: notification.pid,
			type: notification.type,
			text: notification.text,
			image: notification.image,
			link: notification.link,
			read: false,
			lastUpdated: now
		});
		return newNotification.save();
	}
	/* else if(notification.type === 'yeah') {
		// { pid: userToFollowContent.pid, type: "follow", objectID: req.pid, link: `/users/${req.pid}` }
		let existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, objectID: notification.objectID })
		if(existingNotification) {
			existingNotification.lastUpdated = new Date();
			return await existingNotification.save();
		}
		existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, type: 'yeah' });
		if(existingNotification) {
			existingNotification.users.push({
				user: notification.objectID,
				timeStamp: new Date()
			});
			existingNotification.lastUpdated = new Date();
			existingNotification.link = notification.link;
			existingNotification.objectID = notification.objectID;
			return await existingNotification.save();
		}
		else {
			let newNotification = new NOTIFICATION({
				pid: notification.pid,
				type: notification.type,
				users: [{
					user: notification.objectID,
					timestamp: new Date()
				}],
				link: notification.link,
				objectID: notification.objectID,
				read: false,
				lastUpdated: new Date()
			});
			await newNotification.save();
		}
	} */
	return null;
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

export async function createLogEntry(actor: number, action: string, target: string, context: string, fields: string[]): Promise<void> {
	const newLog = new LOGS({
		actor: actor,
		action: action,
		target: target,
		context: context,
		changed_fields: fields
	});
	await newLog.save();
}

const filename = fileURLToPath(import.meta.url);
// The root of the dist/ folder.
export const distFolder = path.dirname(filename);
