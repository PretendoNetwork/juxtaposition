const mongoose = require('mongoose');
const { FuzzySearch } = require('mongoose-fuzzy-search-next');
const { COMMUNITY } = require('@/models/communities');
const { CONTENT } = require('@/models/content');
const { CONVERSATION } = require('@/models/conversation');
const { ENDPOINT } = require('@/models/endpoint');
const { NOTIFICATION } = require('@/models/notifications');
const { POST } = require('@/models/post');
const { SETTINGS } = require('@/models/settings');
const { REPORT } = require('@/models/report');
const { LOGS } = require('@/models/logs');
const { logger } = require('@/logger');
const { config } = require('@/config');

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

async function getCommunities(numberOfCommunities, offset) {
	verifyConnected();
	if (!offset) {
		offset = 0;
	}
	if (numberOfCommunities === -1) {
		return COMMUNITY.find({ parent: null, type: [0, 2] }).skip(offset);
	} else {
		return COMMUNITY.find({ parent: null, type: [0, 2] }).skip(offset).limit(numberOfCommunities);
	}
}

async function getCommunitiesFuzzySearch(search_key, limit, offset) {
	verifyConnected();
	if (limit === -1) {
		return COMMUNITY.find(FuzzySearch(['name'], search_key)).skip(offset);
	} else {
		return COMMUNITY.find(FuzzySearch(['name'], search_key)).skip(offset).limit(limit);
	}
}

async function getMostPopularCommunities(numberOfCommunities) {
	verifyConnected();
	return COMMUNITY.find({ parent: null, type: 0 }).sort({ followers: -1 }).limit(numberOfCommunities);
}

async function getNewCommunities(numberOfCommunities) {
	verifyConnected();
	return COMMUNITY.find({ parent: null, type: 0 }).sort([['created_at', -1]]).limit(numberOfCommunities);
}

async function getSubCommunities(communityID) {
	verifyConnected();
	return COMMUNITY.find({
		parent: communityID
	});
}

async function getCommunityByTitleID(title_id) {
	verifyConnected();
	return COMMUNITY.findOne({
		title_id: title_id
	});
}

async function getCommunityByID(community_id) {
	verifyConnected();
	return COMMUNITY.findOne({
		olive_community_id: community_id
	});
}

async function getTotalPostsByCommunity(community) {
	verifyConnected();
	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).countDocuments();
}

async function getPostByID(postID) {
	verifyConnected();
	return POST.findOne({
		id: postID
	});
}

async function getPostsByUserID(userID) {
	verifyConnected();
	return POST.find({
		pid: userID,
		parent: null,
		removed: false
	});
}

async function getPostReplies(postID, number) {
	verifyConnected();
	return POST.find({
		parent: postID,
		removed: false
	}).limit(number);
}

async function getDuplicatePosts(pid, post) {
	verifyConnected();
	return POST.findOne({
		pid: pid,
		body: post.body,
		painting: post.painting,
		screenshot: post.screenshot,
		parent: null,
		removed: false
	});
}

async function getUserPostRepliesAfterTimestamp(post, numberOfPosts) {
	verifyConnected();
	return POST.find({
		parent: post.pid,
		created_at: { $lt: post.created_at },
		message_to_pid: null,
		removed: false
	}).limit(numberOfPosts);
}

async function getNumberUserPostsByID(userID, number, includeRemoved = false) {
	verifyConnected();
	return POST.find({
		pid: userID,
		parent: null,
		message_to_pid: null,
		...(includeRemoved ? {} : { removed: false })
	}).sort({ created_at: -1 }).limit(number);
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

async function getHotPostsByCommunity(community, numberOfPosts) {
	verifyConnected();
	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).sort({ empathy_count: -1 }).limit(numberOfPosts);
}

async function getNumberNewCommunityPostsByID(community, number) {
	verifyConnected();
	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).sort({ created_at: -1 }).limit(number);
}

async function getNumberPopularCommunityPostsByID(community, limit, offset) {
	verifyConnected();
	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).sort({ empathy_count: -1 }).skip(offset).limit(limit);
}

async function getNumberVerifiedCommunityPostsByID(community, limit, offset) {
	verifyConnected();
	return POST.find({
		community_id: community.olive_community_id,
		verified: true,
		parent: null,
		removed: false
	}).sort({ created_at: -1 }).skip(offset).limit(limit);
}

async function getPostsByCommunity(community, numberOfPosts) {
	verifyConnected();
	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).limit(numberOfPosts);
}

async function getPostsByCommunityKey(community, numberOfPosts, search_key) {
	verifyConnected();
	return POST.find({
		community_id: community.olive_community_id,
		search_key: search_key,
		parent: null,
		removed: false
	}).limit(numberOfPosts);
}

async function getNewPostsByCommunity(community, limit, offset) {
	verifyConnected();
	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).sort({ created_at: -1 }).skip(offset).limit(limit);
}

async function getAllUserPosts(pid) {
	verifyConnected();
	return POST.find({
		pid: pid,
		message_to_pid: null
	});
}

async function getRemovedUserPosts(pid) {
	verifyConnected();
	return POST.find({
		pid: pid,
		message_to_pid: null,
		removed: true
	});
}

async function getUserPostsAfterTimestamp(post, numberOfPosts) {
	verifyConnected();
	return POST.find({
		pid: post.pid,
		created_at: { $lt: post.created_at },
		parent: null,
		message_to_pid: null,
		removed: false
	}).limit(numberOfPosts);
}

async function getUserPostsOffset(pid, limit, offset) {
	verifyConnected();
	return POST.find({
		pid: pid,
		parent: null,
		message_to_pid: null,
		removed: false
	}).skip(offset).limit(limit).sort({ created_at: -1 });
}

async function getCommunityPostsAfterTimestamp(post, numberOfPosts) {
	verifyConnected();
	return POST.find({
		community_id: post.community_id,
		created_at: { $lt: post.created_at },
		parent: null,
		removed: false
	}).limit(numberOfPosts);
}

async function getEndpoints() {
	verifyConnected();
	return ENDPOINT.find({});
}

async function getEndPoint(accessLevel) {
	verifyConnected();
	return ENDPOINT.findOne({
		server_access_level: accessLevel
	});
}

async function getUsersSettings(numberOfUsers) {
	verifyConnected();
	if (numberOfUsers === -1) {
		return SETTINGS.find({});
	} else {
		return SETTINGS.find({}).limit(numberOfUsers);
	}
}

async function getUsersContent(numberOfUsers, offset) {
	verifyConnected();
	if (numberOfUsers === -1) {
		return SETTINGS.find({}).skip(offset);
	} else {
		return SETTINGS.find({}).skip(offset).limit(numberOfUsers);
	}
}

async function getUserSettingsFuzzySearch(search_key, numberOfUsers, offset) {
	verifyConnected();
	if (numberOfUsers === -1) {
		return SETTINGS.find(FuzzySearch(['screen_name'], search_key)).skip(offset);
	} else {
		return SETTINGS.find(FuzzySearch(['screen_name'], search_key)).skip(offset).limit(numberOfUsers);
	}
}

async function getUserSettings(pid) {
	verifyConnected();
	return SETTINGS.findOne({ pid: pid });
}

async function getUserContent(pid) {
	verifyConnected();
	return CONTENT.findOne({ pid: pid });
}

async function getFollowingUsers(content) {
	verifyConnected();
	return SETTINGS.find({
		pid: content.following_users
	});
}

async function getFollowedUsers(content) {
	verifyConnected();
	return SETTINGS.find({
		pid: content.followed_users
	});
}

async function getNewsFeed(content, numberOfPosts) {
	verifyConnected();
	return POST.find({
		$or: [
			{ pid: content.followed_users },
			{ pid: content.pid },
			{ community_id: content.followed_communities }
		],
		parent: null,
		message_to_pid: null,
		removed: false
	}).limit(numberOfPosts).sort({ created_at: -1 });
}

async function getNewsFeedAfterTimestamp(content, numberOfPosts, post) {
	verifyConnected();
	return POST.find({
		$or: [
			{ pid: content.followed_users },
			{ pid: content.pid },
			{ community_id: content.followed_communities }
		],
		created_at: { $lt: post.created_at },
		parent: null,
		message_to_pid: null,
		removed: false
	}).limit(numberOfPosts).sort({ created_at: -1 });
}

async function getNewsFeedOffset(content, limit, offset) {
	verifyConnected();
	return POST.find({
		$or: [
			{ pid: content.followed_users },
			{ pid: content.pid },
			{ community_id: content.followed_communities }
		],
		parent: null,
		message_to_pid: null,
		removed: false
	}).skip(offset).limit(limit).sort({ created_at: -1 });
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

async function getLatestMessage(pid, pid2) {
	verifyConnected();
	return POST.findOne({
		$or: [
			{ pid: pid, message_to_pid: pid2 },
			{ pid: pid2, message_to_pid: pid }
		],
		removed: false
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

async function getLastNotification(pid) {
	verifyConnected();
	return NOTIFICATION.findOne({
		pid: pid
	}).sort({ lastUpdated: -1 }).limit(1);
}

async function getUnreadNotificationCount(pid) {
	verifyConnected();
	return NOTIFICATION.find({
		pid: pid,
		read: false
	}).countDocuments();
}

async function getAllReports(offset, limit) {
	verifyConnected();
	return REPORT.find().sort({ created_at: -1 }).skip(offset).limit(limit);
}

async function getAllOpenReports(offset, limit) {
	verifyConnected();
	return REPORT.find({ resolved: false }).sort({ created_at: -1 }).skip(offset).limit(limit);
}

async function getReportsByReporter(pid, offset, limit) {
	verifyConnected();
	return REPORT.find({ reported_by: pid }).sort({ created_at: -1 }).skip(offset).limit(limit);
}

async function getReportsByOffender(pid, offset, limit) {
	verifyConnected();
	return REPORT.find({ pid: pid }).sort({ created_at: -1 }).skip(offset).limit(limit);
}

async function getReportsByPost(postID, offset, limit) {
	verifyConnected();
	return REPORT.find({ post_id: postID }).sort({ created_at: -1 }).skip(offset).limit(limit);
}

async function getDuplicateReports(pid, postID) {
	verifyConnected();
	return REPORT.findOne({
		reported_by: pid,
		post_id: postID
	});
}

async function getReportById(id) {
	verifyConnected();
	return REPORT.findById(id);
}

async function getLogsForTarget(targetPID, offset, limit) {
	verifyConnected();
	return LOGS.find({ target: targetPID }).sort({ timestamp: -1 }).skip(offset).limit(limit);
}

module.exports = {
	connect,
	getCommunities,
	getCommunitiesFuzzySearch,
	getMostPopularCommunities,
	getNewCommunities,
	getSubCommunities,
	getCommunityByTitleID,
	getCommunityByID,
	getTotalPostsByCommunity,
	getPostsByCommunity,
	getHotPostsByCommunity,
	getNumberNewCommunityPostsByID,
	getNumberPopularCommunityPostsByID,
	getNumberVerifiedCommunityPostsByID,
	getNewPostsByCommunity,
	getPostsByCommunityKey,
	getPostsByUserID,
	getPostReplies,
	getUserPostRepliesAfterTimestamp,
	getNumberUserPostsByID,
	getTotalPostsByUserID,
	getPostByID,
	getDuplicatePosts,
	getEndpoints,
	getEndPoint,
	getUserPostsAfterTimestamp,
	getUserPostsOffset,
	getCommunityPostsAfterTimestamp,
	getNewsFeed,
	getNewsFeedAfterTimestamp,
	getNewsFeedOffset,
	getFollowingUsers,
	getFollowedUsers,
	getConversations,
	getConversationByID,
	getConversationByUsers,
	getConversationMessages,
	getUnreadConversationCount,
	getLatestMessage,
	getUsersSettings,
	getUsersContent,
	getUserSettings,
	getUserSettingsFuzzySearch,
	getUserContent,
	getNotifications,
	getUnreadNotificationCount,
	getNotification,
	getLastNotification,
	getAllUserPosts,
	getRemovedUserPosts,
	getAllReports,
	getAllOpenReports,
	getReportsByReporter,
	getReportsByOffender,
	getReportsByPost,
	getDuplicateReports,
	getReportById,
	getLogsForTarget
};
