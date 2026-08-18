import { genId } from '@/util';
import type { PrismaClient } from '@/prisma/client';
import type { IPost } from '@/types/mongoose/post';

export type FollowNotificationOptions = {
	userToFollow: number;
	currentUser: number;
};

export type EmpathyNotificationOptions = {
	postId: string;
	postAuthor: number;
	currentUser: number;
};

export type ReplyNotificationOptions = {
	reply: IPost;
	replyToUser: number;
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

export type EmpathyNotificationContent = {
	users: {
		timestamp: string; // ISO timestamp
		pid: number;
	}[];
	post: string;
};

export type ReplyNotificationContent = {
	pid: number;
	post: string;
	parent: string;
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

async function groupRecentNotifications(db: PrismaClient, targetPid: number, actingPid: number, type: 'Follow' | 'Empathy', empathyPost?: string) {
	const now = new Date();

	// Prevent sending a new notification if the same user has done so recently
	const weekInMs = 7 * 24 * 60 * 60 * 1000;
	const recentNotifs = await db.notificationRecipient.findMany({
		where: {
			pid: targetPid,
			notification: {
				type,
				updatedAt: {
					gte: new Date(now.getTime() - weekInMs) // Get 7 days worth of notifications
				},
				content: {
					path: ['post'],
					equals: empathyPost
				}
			}
		},
		include: {
			notification: true
		}
	});
	const notifsContent = recentNotifs.map(v => v.notification.content as FollowNotificationContent | EmpathyNotificationContent);
	const hasNotifContentForUser = notifsContent.some(content => content.users.some(usr => usr.pid === actingPid));
	if (hasNotifContentForUser) {
		// Don't send any notification to prevent follow notif spam
		return;
	}

	// Group notifications into batch
	const hourInMs = 60 * 60 * 1000;
	const recentNotif = await db.notificationRecipient.findFirst({
		where: {
			pid: targetPid,
			notification: {
				type,
				updatedAt: {
					gte: new Date(now.getTime() - hourInMs)
				},
				content: {
					path: ['post'],
					equals: empathyPost
				}
			}
		},
		include: {
			notification: true
		}
	});
	if (recentNotif) {
		const newContent = recentNotif.notification.content as FollowNotificationContent | EmpathyNotificationContent;
		newContent.users.push({
			pid: actingPid,
			timestamp: now.toISOString()
		});
		await db.notification.update({
			where: {
				id: recentNotif.notificationId
			},
			data: {
				content: newContent,
				updatedAt: now
			}
		});
		await db.notificationRecipient.update({
			where: {
				id: recentNotif.id
			},
			data: {
				hasRead: false
			}
		});
		return;
	}

	// Create new notification
	const content: FollowNotificationContent | EmpathyNotificationContent = type == 'Empathy'
		? {
				users: [{
					pid: actingPid,
					timestamp: now.toISOString()
				}],
				post: empathyPost
			}
		: {
				users: [{
					pid: actingPid,
					timestamp: now.toISOString()
				}]
			};
	await db.notification.create({
		data: {
			id: genId(),
			content,
			type,
			notificationRecipients: {
				create: {
					id: genId(),
					pid: targetPid
				}
			}
		}
	});
}

export async function createNewFollowNotification(db: PrismaClient, ops: FollowNotificationOptions): Promise<void> {
	return groupRecentNotifications(db, ops.userToFollow, ops.currentUser, 'Follow');
}

export async function createNewEmpathyNotification(db: PrismaClient, ops: EmpathyNotificationOptions): Promise<void> {
	return groupRecentNotifications(db, ops.postAuthor, ops.currentUser, 'Empathy', ops.postId);
}

export async function createNewReplyNotification(db: PrismaClient, ops: ReplyNotificationOptions): Promise<void> {
	const now = new Date();
	const post = ops.reply;
	const targetPid = ops.replyToUser;

	// Prevent sending a new notification if the same user has done so recently
	const weekInMs = 7 * 24 * 60 * 60 * 1000;
	const recentNotifs = await db.notificationRecipient.findMany({
		where: {
			pid: targetPid,
			notification: {
				type: 'Reply',
				updatedAt: {
					gte: new Date(now.getTime() - weekInMs) // Get 7 days worth of notifications
				},
				content: {
					path: ['parent'],
					equals: post.parent!
				}
			}
		},
		include: {
			notification: true
		}
	});
	const notifsContent = recentNotifs.map(v => v.notification.content as ReplyNotificationContent);
	const hasNotifContentForUser = notifsContent.some(content => content.pid === post.pid);
	if (hasNotifContentForUser) {
		// Don't send any notification to prevent follow notif spam
		return;
	}

	const content: ReplyNotificationContent = {
		pid: post.pid,
		parent: post.parent!,
		post: post.id
	};
	await db.notification.create({
		data: {
			id: genId(),
			content,
			type: 'Reply',
			notificationRecipients: {
				create: {
					id: genId(),
					pid: targetPid
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
