import mongoose from 'mongoose';
import { logger } from '@/logger';
import { Community } from '@/models/community';
import { Content } from '@/models/content';
import { Conversation } from '@/models/conversation';
import { Endpoint } from '@/models/endpoint';
import { Post } from '@/models/post';
import { Settings } from '@/models/settings';
import { config } from '@/config';
import type { HydratedConversationDocument } from '@/types/mongoose/conversation';
import type { HydratedContentDocument } from '@/types/mongoose/content';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';
import type { HydratedEndpointDocument } from '@/types/mongoose/endpoint';
import type { HydratedPostDocument, IPostInput } from '@/types/mongoose/post';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';

let connection: mongoose.Connection;

export async function connect(): Promise<void> {
	connection = mongoose.connection;
	connection.on('connected', () => {
		logger.info('MongoDB connected');
	});
	connection.on('error', err => logger.error(err, 'Database connection error'));
	connection.on('close', () => {
		connection.removeAllListeners();
	});

	await mongoose.connect(config.mongoose.uri);
}

function verifyConnected(): void {
	if (!connection) {
		connect();
	}
}

export async function getMostPopularCommunities(limit: number): Promise<HydratedCommunityDocument[]> {
	verifyConnected();

	return Community.find({ parent: null, type: 0 }).sort({ followers: -1 }).limit(limit);
}

export async function getNewCommunities(limit: number): Promise<HydratedCommunityDocument[]> {
	verifyConnected();

	return Community.find({ parent: null, type: 0 }).sort([['created_at', -1]]).limit(limit);
}

export async function getSubCommunities(parentCommunityID: string): Promise<HydratedCommunityDocument[]> {
	verifyConnected();

	return Community.find({
		parent: parentCommunityID
	});
}

export async function getCommunityByTitleID(titleID: string): Promise<HydratedCommunityDocument | null> {
	verifyConnected();

	return Community.findOne({
		title_id: titleID
	});
}

export async function getCommunityByTitleIDs(titleIDs: string[]): Promise<HydratedCommunityDocument | null> {
	verifyConnected();

	return Community.findOne({
		title_id: { $in: titleIDs }
	});
}

export async function getCommunityByID(communityID: string): Promise<HydratedCommunityDocument | null> {
	verifyConnected();

	return Community.findOne({
		community_id: communityID
	});
}

export async function getPostByID(postID: string): Promise<HydratedPostDocument | null> {
	verifyConnected();

	return Post.findOne({
		id: postID
	});
}

export async function getPostReplies(postID: string, limit: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return Post.find({
		parent: postID,
		removed: false,
		app_data: { $ne: null }
	}).limit(limit);
}

export async function getDuplicatePosts(pid: number, post: IPostInput): Promise<HydratedPostDocument | null> {
	verifyConnected();

	return Post.findOne({
		pid: pid,
		body: post.body,
		painting: post.painting,
		screenshot: post.screenshot,
		parent: null,
		removed: false
	});
}

export async function getPostsBytitleID(titleID: string[], limit: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return Post.find({
		title_id: titleID,
		parent: null,
		removed: false
	}).sort({ created_at: -1 }).limit(limit);
}

export async function getEndpoints(): Promise<HydratedEndpointDocument[]> {
	verifyConnected();

	return Endpoint.find({});
}

export async function getEndpoint(accessLevel: string): Promise<HydratedEndpointDocument | null> {
	verifyConnected();

	return Endpoint.findOne({
		server_access_level: accessLevel
	});
}

export async function getUserSettings(pid: number): Promise<HydratedSettingsDocument | null> {
	verifyConnected();

	return Settings.findOne({ pid: pid });
}

export async function getUserContent(pid: number): Promise<HydratedContentDocument | null> {
	verifyConnected();

	return Content.findOne({ pid: pid });
}

export async function getFollowedUsers(content: HydratedContentDocument): Promise<HydratedSettingsDocument[]> {
	verifyConnected();

	return Settings.find({
		pid: content.followed_users
	});
}

export async function getConversationByUsers(pids: number[]): Promise<HydratedConversationDocument | null> {
	verifyConnected();

	return Conversation.findOne({
		$and: [
			{ 'users.pid': pids[0] },
			{ 'users.pid': pids[1] }
		]
	});
}

export async function getFriendMessages(pid: string, search_key: string[], limit: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return Post.find({
		message_to_pid: pid,
		search_key: search_key,
		parent: null,
		removed: false
	}).sort({ created_at: 1 }).limit(limit);
}
