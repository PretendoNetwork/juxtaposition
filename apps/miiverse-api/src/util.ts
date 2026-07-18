import { randomUUID } from 'node:crypto';
import { DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { SystemType } from '@pretendonetwork/grpc/account/v2/token_info';
import { config } from '@/config';
import { logger } from '@/logger';
import { grpcAccount, grpcApi, grpcFriends } from '@/grpc';
import { getS3 } from '@/s3';
import { AutomodLog } from '@/models/automodLog';
import type { IncomingHttpHeaders } from 'node:http';
import type { ObjectCannedACL } from '@aws-sdk/client-s3';
import type { FriendRequest } from '@pretendonetwork/grpc/friends/v2/friend_request';
import type { GetUserDataResponse as ApiGetUserDataResponse } from '@pretendonetwork/grpc/api/v2/get_user_data_rpc';
import type { ParsedQs } from 'qs';
import type { GetPNIDResponse } from '@pretendonetwork/grpc/account/v2/get_pnid_rpc';
import type { AutomodAction } from '@/models/automodLog';
import type { ParamPack } from '@/types/common/param-pack';
import type { IPostInput } from '@/types/mongoose/post';
import type { HydratedAutomodRuleDocument } from '@/models/automodRules';

// TODO - This doesn't really belong here
export function getInvalidPostRegex(): RegExp {
	return /[^\p{L}\p{P}\d\n\r$^¨←→↑↓√|¦⇒⇔¤¢€£¥™©®+×÷=±∞`΄΅˘˙¸˛~˜°¹²³♭♪¬¯¼½¾♡♥●◆■▲▼☆★♀♂<> ]/gu;
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

export async function getUserDataFromServiceToken(token: string): Promise<GetPNIDResponse | null> {
	try {
		const userData = await grpcAccount.client().exchangeIndependentServiceTokenForUserData({
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

export async function uploadCDNAsset(key: string, data: Buffer, acl: ObjectCannedACL): Promise<boolean> {
	const awsPutParams = new PutObjectCommand({
		Body: data,
		Key: key,
		Bucket: config.s3.bucket,
		ACL: acl
	});
	try {
		await getS3().send(awsPutParams);
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
		await getS3().send(awsDeleteParams);
		return true;
	} catch (e) {
		logger.error(e, 'Could not delete from CDN');
		return false;
	}
}

export async function getUserFriendPIDs(pid: number): Promise<number[]> {
	const response = await grpcFriends.client().getUserFriendPIDs({
		pid: pid
	});

	return response.pids;
}

export async function getUserFriendRequestsIncoming(pid: number): Promise<FriendRequest[]> {
	const response = await grpcFriends.client().getUserFriendRequestsIncoming({
		pid: pid
	});

	return response.friendRequests;
}

export function getUserAccountData(pid: number): Promise<GetPNIDResponse> {
	// getUserData is deprecated, but the alternatives aren't implemented yet...
	return grpcAccount.client().getUserData({
		pid
	});
}

export function getUserDataFromToken(token: string): Promise<ApiGetUserDataResponse> {
	return grpcApi.client().getUserData({}, {
		metadata: grpcApi.createHeaders({
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

export type AutomodRuleEvaluationMatch = {
	start: number;
	end: number;
};
export type AutomodRuleEvaluation = {
	violatedRule: HydratedAutomodRuleDocument;
	matches: AutomodRuleEvaluationMatch[];
	action: AutomodAction;
} | null;

export function evaluateAutomodRules(post: IPostInput, rules: HydratedAutomodRuleDocument[]): AutomodRuleEvaluation {
	const blockRules = rules.filter(v => v.mode === 'block');
	const nonBlockRules = rules.filter(v => v.mode !== 'block');
	const orderedRules = [...blockRules, ...nonBlockRules];

	for (const rule of orderedRules) {
		let hasMatched = false;
		const matches: AutomodRuleEvaluationMatch[] = [];
		if (rule.type === 'keyword') {
			const bodyNormalized = (post.body ?? '').toLowerCase();
			const keywordsToCheck = rule.keyword_settings?.keywords ?? [];
			keywordsToCheck.forEach((keywordUpper) => {
				const keyword = keywordUpper.toLowerCase();
				const index = bodyNormalized.indexOf(keyword);
				if (index < 0) {
					return;
				}

				hasMatched = true;
				matches.push({
					start: index,
					end: index + keyword.length
				});
			});
		}

		if (hasMatched) {
			return {
				action: rule.mode === 'block' ? 'blocked' : 'logged',
				matches,
				violatedRule: rule
			};
		}
	}

	return null; // No rules apply to this post
}

export async function performAutomodAction(post: IPostInput, evaluation: AutomodRuleEvaluation): Promise<{ allowPost: boolean }> {
	if (!evaluation) {
		return { allowPost: true };
	}

	if (evaluation.action === 'blocked' || evaluation.action === 'logged') {
		const allowPost = evaluation.action === 'blocked' ? false : true;
		await AutomodLog.create({
			action: evaluation.action,
			author: post.pid,
			post_id: post.id,
			post_content_body: post.body ?? '',
			created_at: new Date(),
			rule_id: evaluation.violatedRule.id,
			parent_post_id: post.parent ?? null,
			community_id: post.community_id,
			matches: evaluation.matches.map(match => ({
				start: match.start,
				end: match.end
			}))
		});
		return {
			allowPost
		};
	}

	throw new Error('Invalid automod evaluation');
}

export function genId(): string {
	return randomUUID();
}
