import { z } from 'zod';
import { guards } from '@/services/internal/middleware/guards';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { errors } from '@/services/internal/errors';
import { mapBannedSelf, mapSelf, mapSelfFriendRequest, mapSelfNotificationCount, selfFriendRequestSchema, selfNotificationCountSchema, selfSchema } from '@/services/internal/contract/self';
import { Settings } from '@/models/settings';
import { Notification } from '@/models/notification';
import { getUserFriendRequestsIncoming } from '@/util';
import type { SelfFriendRequestDto } from '@/services/internal/contract/self';

export const selfRouter = createInternalApiRouter();

selfRouter.get({
	path: '/self',
	name: 'self.get',
	description: 'Get everything necccesary to represent the current user',
	guard: guards.guest,
	schema: {
		response: selfSchema
	},
	async handler({ auth }) {
		if (!auth) {
			throw new errors.unauthorized('User is not logged in');
		}

		// TODO these updates should probably be done in a middleware
		const userSettings = await Settings.findOne({ pid: auth.pnid.pid });
		if (userSettings) {
			// Clear ban lift date if neccesary
			const hasBan = userSettings.account_status !== 0;
			const shouldClearBan = userSettings.ban_lift_date && new Date(userSettings.ban_lift_date) <= new Date();
			if (hasBan && shouldClearBan) {
				userSettings.account_status = 0;
			}

			// Record activity & update metadata
			userSettings.last_active = new Date();
			if (auth.pnid.mii) {
				userSettings.screen_name = auth.pnid.mii.name;
			}

			// Save changes to current auth state
			await userSettings.save();
			auth.settings = userSettings;
		}

		const accountStatus = auth.settings?.account_status ?? 0;
		const isJuxtBanned = accountStatus < 0 || accountStatus > 1;
		const isNetworkBanned = auth.pnid.accessLevel < 0 ||
			auth.pnid.permissions?.bannedAllPermanently === true ||
			auth.pnid.permissions?.bannedAllTemporarily === true;

		if (isNetworkBanned) {
			return mapBannedSelf(auth, 'network_ban', null, null);
		}
		if (isJuxtBanned) {
			const reason = userSettings?.ban_reason ?? null;
			const endDate = userSettings?.ban_lift_date ?? null;
			if (accountStatus === 2) {
				return mapBannedSelf(auth, 'temp_ban', endDate, reason);
			}

			// Technically it has a endDate, but we don't want the frontend to know about it
			return mapBannedSelf(auth, 'perma_ban', null, reason);
		}

		return mapSelf(auth);
	}
});

selfRouter.get({
	path: '/self/notifications',
	name: 'self.getNotifications',
	description: 'Get notification counts for current user',
	guard: guards.user,
	schema: {
		response: selfNotificationCountSchema
	},
	async handler({ auth }) {
		const account = auth!;

		const notificationCount = await Notification.countDocuments({
			pid: account.pnid.pid,
			read: false
		});

		return mapSelfNotificationCount(notificationCount);
	}
});

selfRouter.get({
	path: '/self/friend-requests',
	name: 'self.getFrienqRequests',
	description: 'Get friend requests for current user',
	guard: guards.user,
	schema: {
		response: z.array(selfFriendRequestSchema)
	},
	async handler({ auth }) {
		const account = auth!;

		const now = new Date();
		const allRequests = (await getUserFriendRequestsIncoming(account.pnid.pid)).reverse();
		const validRequests = allRequests.filter(request => new Date(Number(request.expires) * 1000) > new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));

		const senders = validRequests.map(v => v.sender);
		const relatedUsers = await Settings.find({ pid: { $in: senders } });

		return validRequests.reduce<SelfFriendRequestDto[]>((acc, req) => {
			const user = relatedUsers.find(v => v.pid === req.sender);
			if (user) {
				acc.push(mapSelfFriendRequest(req, user));
			}

			return acc;
		}, []);
	}
});
