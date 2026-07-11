import { genId } from '@/util';
import type { PrismaClient } from '@/prisma/client';
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

export type FollowNotificationContent = {
	users: {
		timestamp: string; // ISO timestamp
		pid: number;
	}[];
};

export type SystemNotificationContent = {
	imagePath: string;
	link: string;
	text: string;
};

export type PostDeletedNotificationContent = {
	postId: string;
	reason?: string;
	postType: 'comment' | 'post';
};

export type LimitedFromPostingNotificationContent = {
	reason?: string;
	until?: string; // ISO timestamp,
};

export async function createNewFollowNotification(db: PrismaClient, ops: FollowNotificationOptions): Promise<void> {
	const now = new Date();

	// Prevent sending a new notification if the same user has done so recently
	const weekInMs = 7 * 24 * 60 * 60 * 1000;
	const recentFollowNotifs = await db.notificationRecipient.findMany({
		where: {
			pid: ops.userToFollow,
			notification: {
				type: 'Follow',
				updatedAt: {
					gte: new Date(now.getTime() - weekInMs) // Get 7 days worth of follow notifications
				}
			}
		},
		include: {
			notification: true
		}
	});
	const followNotifsContent = recentFollowNotifs.map(v => v.notification.content as FollowNotificationContent);
	const hasFollowNotifContentForUser = followNotifsContent.some(content => content.users.some(usr => usr.pid === ops.currentUser));
	if (hasFollowNotifContentForUser) {
		// Don't send any notification to prevent follow notif spam
		return;
	}

	// Group follower notifications into batch
	const hourInMs = 60 * 60 * 1000;
	const recentFollowNotif = await db.notificationRecipient.findFirst({
		where: {
			pid: ops.userToFollow,
			notification: {
				type: 'Follow',
				updatedAt: {
					gte: new Date(now.getTime() - hourInMs)
				}
			}
		},
		include: {
			notification: true
		}
	});
	if (recentFollowNotif) {
		const newContent = recentFollowNotif.notification.content as FollowNotificationContent;
		newContent.users.push({
			pid: ops.currentUser,
			timestamp: now.toISOString()
		});
		await db.notification.update({
			where: {
				id: recentFollowNotif.notificationId
			},
			data: {
				content: newContent,
				updatedAt: now
			}
		});
		await db.notificationRecipient.update({
			where: {
				id: recentFollowNotif.id
			},
			data: {
				hasRead: false
			}
		});
		return;
	}

	// Create new notification
	const content: FollowNotificationContent = {
		users: [{
			pid: ops.currentUser,
			timestamp: now.toISOString()
		}]
	};
	await db.notification.create({
		data: {
			id: genId(),
			content,
			type: 'Follow',
			notificationRecipients: {
				create: {
					id: genId(),
					pid: ops.userToFollow
				}
			}
		}
	});
}

export async function createNewPostDeletionNotification(db: PrismaClient, ops: PostDeletionNotificationOptions): Promise<void> {
	const content: PostDeletedNotificationContent = {
		postId: ops.post.id,
		reason: ops.reason,
		postType: ops.post.parent ? 'comment' : 'post'
	};
	await db.notification.create({
		data: {
			id: genId(),
			content,
			type: 'PostDeleted',
			notificationRecipients: {
				create: {
					id: genId(),
					pid: ops.postAuthor
				}
			}
		}
	});
}

export async function createNewLimitedPostingNotification(db: PrismaClient, ops: LimitedPostingNotificationOptions): Promise<void> {
	const content: LimitedFromPostingNotificationContent = {
		until: ops.banLiftDate?.toISOString() ?? undefined,
		reason: ops.reason ?? undefined
	};
	await db.notification.create({
		data: {
			id: genId(),
			content,
			type: 'LimitedFromPosting',
			notificationRecipients: {
				create: {
					id: genId(),
					pid: ops.pid
				}
			}
		}
	});
}
