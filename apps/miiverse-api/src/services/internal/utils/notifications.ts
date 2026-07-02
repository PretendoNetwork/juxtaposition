import { humanDate } from '@/services/internal/utils/dates';
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
		timestamp: string; // Iso timestamp
		pid: number;
	}[];
};

export type SystemNotificationContent = {
	imagePath: string;
	link: string;
	text: string;
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
	const postType = ops.post.parent ? 'comment' : 'post';
	const content: SystemNotificationContent = {
		imagePath: '/images/bandwidthalert.png',
		link: '/titles/2551084080/new',
		text: `Your ${postType} "${ops.post.id}" has been removed` +
			(ops.reason ? ` for the following reason: "${ops.reason}". ` : '. ') +
			`Click this message to view the Juxtaposition Code of Conduct. ` +
			`If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/juxt-mods/).`
	};
	await db.notification.create({
		data: {
			id: genId(),
			content,
			type: 'System',
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
	const firstSentence = ops.banLiftDate ? `You have been Limited from Posting until ${humanDate(ops.banLiftDate)}. ` : `You have been Limited from Posting. `;
	const content: SystemNotificationContent = {
		imagePath: '/images/bandwidthalert.png',
		link: '/titles/2551084080/new',
		text: firstSentence +
			(ops.reason ? `Reason: "${ops.reason}". ` : '') +
			`Click this message to view the Juxtaposition Code of Conduct. ` +
			`If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).`
	};
	await db.notification.create({
		data: {
			id: genId(),
			content,
			type: 'System',
			notificationRecipients: {
				create: {
					id: genId(),
					pid: ops.pid
				}
			}
		}
	});
}
