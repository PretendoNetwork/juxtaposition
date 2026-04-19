import mongoose from 'mongoose';
import { CONTENT } from '@/models/content';
import { POST } from '@/models/post';
import { SETTINGS } from '@/models/settings';
import { REPORT } from '@/models/report';
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

async function getUserSettings(pid) {
	verifyConnected();
	return SETTINGS.findOne({ pid: pid });
}

async function getUserContent(pid) {
	verifyConnected();
	return CONTENT.findOne({ pid: pid });
}

async function getDuplicateReports(pid, postID) {
	verifyConnected();
	return REPORT.findOne({
		reported_by: pid,
		post_id: postID
	});
}

export const database = {
	connect,
	getPostByID,
	getDuplicatePosts,
	getUserSettings,
	getUserContent,
	getDuplicateReports
};
