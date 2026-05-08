import { Notification } from '@/models/notification';
import { humanDate } from '@/services/internal/utils/dates';
import type { IPost } from '@/types/mongoose/post';

export type FollowNotificationOptions = {
	userToFollow: number;
	currentUser: number;
};

export type PostDeletionNotificationOptions = {
	postAuthor: number;
	post: IPost;
	reason?: string;
};

export type LimitedPostingNotificationOptions = {
	pid: number;
	banLiftDate: Date | null;
	reason: string | null;
};

export async function createNewFollowNotification(ops: FollowNotificationOptions): Promise<void> {
	const now = new Date();
	const url = `/users/${ops.currentUser}`;

	// Same user has followed previously
	const existingNotif = await Notification.findOne({ pid: ops.userToFollow, objectID: ops.currentUser });
	if (existingNotif) {
		existingNotif.lastUpdated = now;
		existingNotif.read = false;
		await existingNotif.save();
		return;
	}

	// Combine existing follower notification
	const last60min = new Date(now.getTime() - 60 * 60 * 1000);
	const groupedNotif = await Notification.findOne({ pid: ops.userToFollow, type: 'follow', lastUpdated: { $gte: last60min } });
	if (groupedNotif) {
		groupedNotif.users.push({
			user: ops.currentUser,
			timestamp: now
		});
		groupedNotif.lastUpdated = now;
		groupedNotif.link = url;
		groupedNotif.objectID = ops.currentUser.toString();
		groupedNotif.read = false;
		await groupedNotif.save();
		return;
	}

	// Create new notification
	await Notification.create({
		pid: ops.userToFollow,
		type: 'follow',
		users: [{
			user: ops.currentUser,
			timestamp: now
		}],
		link: url,
		objectID: ops.currentUser.toString(),
		read: false,
		lastUpdated: now
	});
}

export async function createNewPostDeletionNotification(ops: PostDeletionNotificationOptions): Promise<void> {
	const postType = ops.post.parent ? 'comment' : 'post';

	await Notification.create({
		pid: ops.postAuthor,
		type: 'notice',
		read: false,
		lastUpdated: new Date(),
		text: `Your ${postType} "${ops.post.id}" has been removed` +
			(ops.reason ? ` for the following reason: "${ops.reason}". ` : '. ') +
			`Click this message to view the Juxtaposition Code of Conduct. ` +
			`If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/juxt-mods/).`,
		image: '/images/bandwidthalert.png',
		link: '/titles/2551084080/new'
	});
}

export async function createNewLimitedPostingNotification(ops: LimitedPostingNotificationOptions): Promise<void> {
	const firstSentence = ops.banLiftDate ? `You have been Limited from Posting until ${humanDate(ops.banLiftDate)}. ` : `You have been Limited from Posting. `;

	await Notification.create({
		pid: ops.pid,
		type: 'notice',
		text: firstSentence +
			(ops.reason ? `Reason: "${ops.reason}". ` : '') +
			`Click this message to view the Juxtaposition Code of Conduct. ` +
			`If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).`,
		image: '/images/bandwidthalert.png',
		link: '/titles/2551084080/new'
	});
}
