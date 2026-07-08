import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import { Post } from '@/models/post';
import { errors } from '@/services/internal/errors';
import { getUserAccountData } from '@/util';
import { Content } from '@/models/content';
import { mapModerationProfile, moderationProfileSchema } from '@/services/internal/contract/admin/moderationProfile';
import { adminUserProfileSchema, mapAdminUserProfile } from '@/services/internal/contract/admin/adminUsers';
import { createNewLimitedPostingNotification } from '@/services/internal/utils/notifications';
import { accountStatusDisplayMap } from '@/services/internal/utils/communities';
import { accountActionDisplayMap, createLogEntry } from '@/services/internal/utils/auditLogs';
import { humanDate } from '@/services/internal/utils/dates';
import type { LogEntryActions } from '@/models/logs';
import type { UserUpdateInput } from '@/prisma/models';

export const adminUsersRouter = createInternalApiRouter();

adminUsersRouter.get({
	path: '/admin/users',
	name: 'admin.users.list',
	guard: guards.moderator,
	schema: {
		query: z.object({
			search: z.string().optional()
		}).extend(pageControlSchema()),
		response: pageDtoSchema(shallowUserSchema)
	},
	async handler({ query, db }) {
		// TODO search query
		const dbQuery = {};
		const users = await db.user.findMany({
			where: dbQuery,
			skip: query.offset,
			take: query.limit
		});
		const total = await db.user.count({
			where: dbQuery
		});

		return mapPage(total, users.map(v => mapShallowUser(v)));
	}
});

adminUsersRouter.get({
	path: '/admin/users/:id/profile',
	name: 'admin.users.getProfile',
	description: 'Get profile information with admin rights',
	guard: guards.moderator,
	allowNotFound: true,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		response: adminUserProfileSchema
	},
	async handler({ params, db }) {
		const user = await db.user.findUnique({
			where: {
				pid: params.id
			},
			include: {
				settings: true
			}
		});
		const content = await Content.findOne({ pid: params.id });
		const pnid = await getUserAccountData(params.id).catch(() => {
			return null;
		});
		if (!user || !content || !pnid) {
			throw errors.for('not_found');
		}

		const followers = content.following_users.filter(v => v !== 0).length;
		const totalPosts = await Post.find({
			pid: params.id,
			parent: null,
			message_to_pid: null,
			removed: false
		}).countDocuments();

		return mapAdminUserProfile(user, pnid, followers, totalPosts);
	}
});

adminUsersRouter.get({
	path: '/admin/users/:id/mod-profile',
	name: 'admin.users.getModProfile',
	description: 'Get moderation profile of a user',
	guard: guards.moderator,
	allowNotFound: true,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		response: moderationProfileSchema
	},
	async handler({ params, db }) {
		const user = await db.user.findUnique({
			where: {
				pid: params.id
			}
		});
		if (!user) {
			throw errors.for('not_found');
		}

		return mapModerationProfile(user);
	}
});

adminUsersRouter.patch({
	path: '/admin/users/:id/mod-profile',
	name: 'admin.users.updateModProfile',
	description: 'Update moderation profile of a user',
	guard: guards.moderator,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		body: z.object({
			accountStatus: z.coerce.number().optional(),
			banLiftDate: z.coerce.date().nullable().optional(),
			banReason: z.string().nullable().optional()
		}),
		response: moderationProfileSchema
	},
	async handler({ params, db, body, auth }) {
		const account = auth!;
		const oldUser = await db.user.findUnique({
			where: {
				pid: params.id
			}
		});
		if (!oldUser) {
			throw errors.for('not_found');
		}

		let banLiftDate = body.banLiftDate;
		if (body.accountStatus == 0) {
			banLiftDate = null; // If account status is normal, remove ban date
		}

		const data: UserUpdateInput = {};
		data.accountStatus = body.accountStatus;
		data.bannedBy = account.pnid.pid;
		data.banEndsAt = banLiftDate;
		data.banReason = body.banReason;
		const newUser = await db.user.update({
			where: {
				pid: oldUser.pid
			},
			data
		});

		const accountStatusChanged = oldUser.accountStatus !== newUser.accountStatus;
		if (accountStatusChanged && newUser.accountStatus === 1) {
			await createNewLimitedPostingNotification(db, {
				pid: newUser.pid,
				banLiftDate: newUser.banEndsAt ?? null,
				reason: newUser.banReason ?? null
			});
		}

		let action: LogEntryActions = 'UPDATE_USER';
		const changes = [];
		const fields = [];

		if (accountStatusChanged) {
			const oldStatus = accountStatusDisplayMap[oldUser.accountStatus];
			const newStatus = accountStatusDisplayMap[newUser.accountStatus];
			action = accountActionDisplayMap[newUser.accountStatus] ?? 'NONE';
			fields.push('account_status');
			changes.push(`Account Status changed from "${oldStatus}" to "${newStatus}"`);
		}

		if (accountStatusChanged || oldUser.banEndsAt !== newUser.banEndsAt) {
			fields.push('ban_lift_date');
			changes.push(`User Ban Lift Date changed from "${humanDate(oldUser.banEndsAt)}" to "${humanDate(newUser.banEndsAt)}"`);
		}

		if (accountStatusChanged || oldUser.banReason !== newUser.banReason) {
			fields.push('ban_reason');
			changes.push(`Ban reason changed from "${oldUser.banReason}" to "${newUser.banReason}"`);
		}

		if (changes.length > 0) {
			await createLogEntry({
				actorId: account.pnid.pid,
				action,
				targetResourceId: newUser.pid.toString(),
				context: changes.join('\n'),
				fields
			});
		}

		return mapModerationProfile(newUser);
	}
});
