import mongoose from 'mongoose';
import { CONTENT } from '@/models/content';
import { CONVERSATION } from '@/models/conversation';
import { ENDPOINT } from '@/models/endpoint';
import { NOTIFICATION } from '@/models/notifications';
import { POST } from '@/models/post';
import { SETTINGS } from '@/models/settings';
import { REPORT } from '@/models/report';
import { LOGS } from '@/models/logs';
import { logger } from '@/logger';
import { config } from '@/config';

let connection;
mongoose.set('strictQuery', true);

async function connect() {
	connection = mongoose.connection;
	connection.on('connected', function () {
		logger.info(`MongoDB connected ${this.name}`);
	});
	connection.on('error', err => logger.error(err, 'Database connection error'));
	connection.on('close', () => {
		connection.removeAllListeners();
	});

	await mongoose.connect(config.mongoose.uri);
}

function verifyConnected() {
	if (!connection) {
		connect();
	}
}

export function notBanned() {
	return { account_status: { $in: [0, 1] } };
}

async function getPostByID(postID) {
	verifyConnected();
	return POST.findOne({
		id: postID
	});
}

async function getDuplicatePosts(pid, post, olderThanMs) {
	verifyConnected();
	return POST.findOne({
		pid: pid,
		body: post.body,
		screenshot: post.screenshot,
		painting: post.painting,
		created_at: {
			$gte: new Date(Date.now() - olderThanMs)
		},
		parent: null,
		removed: false
	});
}

async function getTotalPostsByUserID(userID) {
	verifyConnected();
	return POST.find({
		pid: userID,
		parent: null,
		message_to_pid: null,
		removed: false
	}).countDocuments();
}

async function getEndPoint(accessLevel) {
	verifyConnected();
	return ENDPOINT.findOne({
		server_access_level: accessLevel
	});
}

async function getUserSettings(pid) {
	verifyConnected();
	return SETTINGS.findOne({ pid: pid });
}

async function getUserContent(pid) {
	verifyConnected();
	return CONTENT.findOne({ pid: pid });
}

async function getConversations(pid) {
	verifyConnected();
	return CONVERSATION.find({
		'users.pid': pid
	}).sort({ last_updated: -1 });
}

async function getUnreadConversationCount(pid) {
	verifyConnected();
	return CONVERSATION.find({
		users: {
			$elemMatch: {
				pid: pid,
				read: false
			}
		}

	}).countDocuments();
}

async function getConversationByID(community_id) {
	verifyConnected();
	return CONVERSATION.findOne({
		type: 3,
		id: community_id
	});
}

async function getConversationMessages(community_id, limit, offset) {
	verifyConnected();
	return POST.find({
		community_id: community_id,
		parent: null,
		removed: false
	}).sort({ created_at: 1 }).skip(offset).limit(limit);
}

async function getConversationByUsers(pids) {
	verifyConnected();
	return CONVERSATION.findOne({
		$and: [
			{ 'users.pid': pids[0] },
			{ 'users.pid': pids[1] }
		]
	});
}

async function getNotifications(pid, limit, offset) {
	verifyConnected();
	return NOTIFICATION.find({
		pid: pid
	}).sort({ lastUpdated: -1 }).skip(offset).limit(limit);
}

async function getNotification(pid, type, reference_id) {
	verifyConnected();
	return NOTIFICATION.findOne({
		pid: pid,
		type: type,
		reference_id: reference_id
	});
}

async function getUnreadNotificationCount(pid) {
	verifyConnected();
	return NOTIFICATION.find({
		pid: pid,
		read: false
	}).countDocuments();
}

async function getDuplicateReports(pid, postID) {
	verifyConnected();
	return REPORT.findOne({
		reported_by: pid,
		post_id: postID
	});
}

async function getLogsForTarget(targetPID, offset, limit) {
	verifyConnected();
	return LOGS.find({ target: targetPID }).sort({ timestamp: -1 }).skip(offset).limit(limit);
}

export const database = {
	connect,
	getTotalPostsByUserID,
	getPostByID,
	getDuplicatePosts,
	getEndPoint,
	getConversations,
	getConversationByID,
	getConversationByUsers,
	getConversationMessages,
	getUnreadConversationCount,
	getUserSettings,
	getUserContent,
	getNotifications,
	getUnreadNotificationCount,
	getNotification,
	getDuplicateReports,
	getLogsForTarget
};
