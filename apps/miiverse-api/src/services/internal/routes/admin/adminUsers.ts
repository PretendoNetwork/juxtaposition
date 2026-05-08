import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import { buildSearchQuery } from '@/services/internal/utils/search';
import { Settings } from '@/models/settings';
import { Post } from '@/models/post';
import { errors } from '@/services/internal/errors';
import { getUserAccountData } from '@/util';
import { Content } from '@/models/content';
import { mapModerationProfile, moderationProfileSchema } from '@/services/internal/contract/admin/moderationProfile';
import { adminUserProfileSchema, mapAdminUserProfile } from '@/services/internal/contract/admin/adminUsers';
import { deleteOptional } from '@/services/internal/utils';
import { createNewLimitedPostingNotification } from '@/services/internal/utils/notifications';
import { accountStatusDisplayMap } from '@/services/internal/utils/communities';
import { accountActionDisplayMap, createLogEntry } from '@/services/internal/utils/auditLogs';
import { humanDate } from '@/services/internal/utils/dates';
import type { FilterQuery } from 'mongoose';
import type { ISettings } from '@/types/mongoose/settings';
import type { LogEntryActions } from '@/models/logs';

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
	async handler({ query }) {
		const dbQuery: FilterQuery<ISettings> = query.search ? buildSearchQuery(['pid', 'screen_name'], query.search) : {};
		const users = await Settings
			.find(dbQuery)
			.limit(query.limit)
			.skip(query.offset);
		const total = await Settings.countDocuments(dbQuery);

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
	async handler({ params }) {
		const settings = await Settings.findOne({ pid: params.id });
		const content = await Content.findOne({ pid: params.id });
		const pnid = await getUserAccountData(params.id).catch(() => {
			return null;
		});
		if (!settings || !content || !pnid) {
			throw errors.for('not_found');
		}

		const followers = content.following_users.filter(v => v !== 0).length;
		const totalPosts = await Post.find({
			pid: params.id,
			parent: null,
			message_to_pid: null,
			removed: false
		}).countDocuments();

		return mapAdminUserProfile(settings, pnid, followers, totalPosts);
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
	async handler({ params }) {
		const settings = await Settings.findOne({ pid: params.id });
		if (!settings) {
			throw errors.for('not_found');
		}

		return mapModerationProfile(settings);
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
	async handler({ params, body, auth }) {
		const account = auth!;
		const oldSettings = await Settings.findOne({ pid: params.id });
		if (!oldSettings) {
			throw errors.for('not_found');
		}

		let banLiftDate = body.banLiftDate;
		if (body.accountStatus == 0) {
			banLiftDate = null; // If account status is normal, remove ban date
		}
		const settings = await Settings.findOneAndUpdate({ pid: params.id }, {
			$set: deleteOptional({
				account_status: body.accountStatus,
				ban_lift_date: banLiftDate,
				banned_by: account.pnid.pid,
				ban_reason: body.banReason
			})
		}, { new: true });
		if (!settings) {
			throw new Error('Settings gone after save');
		}

		const accountStatusChanged = oldSettings.account_status !== settings.account_status;
		if (accountStatusChanged && settings.account_status === 1) {
			await createNewLimitedPostingNotification({
				pid: settings.pid,
				banLiftDate: settings.ban_lift_date ?? null,
				reason: settings.ban_reason ?? null
			});
		}

		let action: LogEntryActions = 'UPDATE_USER';
		const changes = [];
		const fields = [];

		if (accountStatusChanged) {
			const oldStatus = accountStatusDisplayMap[oldSettings.account_status];
			const newStatus = accountStatusDisplayMap[settings.account_status];
			action = accountActionDisplayMap[settings.account_status] ?? 'NONE';
			fields.push('account_status');
			changes.push(`Account Status changed from "${oldStatus}" to "${newStatus}"`);
		}

		if (accountStatusChanged || oldSettings.ban_lift_date !== settings.ban_lift_date) {
			fields.push('ban_lift_date');
			changes.push(`User Ban Lift Date changed from "${humanDate(oldSettings.ban_lift_date)}" to "${humanDate(settings.ban_lift_date)}"`);
		}

		if (accountStatusChanged || oldSettings.ban_reason !== settings.ban_reason) {
			fields.push('ban_reason');
			changes.push(`Ban reason changed from "${oldSettings.ban_reason}" to "${settings.ban_reason}"`);
		}

		if (changes.length > 0) {
			await createLogEntry({
				actorId: account.pnid.pid,
				action,
				targetResourceId: settings.pid.toString(),
				context: changes.join('\n'),
				fields
			});
		}

		return mapModerationProfile(settings);
	}
});
