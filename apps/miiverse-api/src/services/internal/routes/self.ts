import { guards } from '@/services/internal/middleware/guards';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { errors } from '@/services/internal/errors';
import { mapBannedSelf, mapSelf, selfSchema } from '@/services/internal/contract/self';
import { Settings } from '@/models/settings';

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

		const userSettings = await Settings.findOne({ pid: auth.pnid.pid });
		if (userSettings) {
			// Clear ban lift date if neccesary
			if (userSettings.ban_lift_date && new Date(userSettings.ban_lift_date) <= new Date()) {
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
		const isNetworkBanned = auth.pnid.accessLevel < 0;

		if (isNetworkBanned) {
			return mapBannedSelf(auth, 'network_ban', null, null);
		}
		if (isJuxtBanned) {
			const reason = userSettings?.ban_reason ?? null;
			const endDate = userSettings?.ban_lift_date ?? null;
			if (accountStatus === 2) {
				return mapBannedSelf(auth, 'temp_ban', endDate, reason);
			}
			return mapBannedSelf(auth, 'perma_ban', endDate, reason);
		}

		return mapSelf(auth);
	}
});
