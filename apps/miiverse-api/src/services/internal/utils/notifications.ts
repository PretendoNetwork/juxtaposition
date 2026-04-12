import { Notification } from '@/models/notification';

export type FollowNotificationOptions = {
	userToFollow: number;
	currentUser: number;
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
