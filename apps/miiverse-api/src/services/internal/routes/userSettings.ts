import { z } from 'zod';
import { guards } from '@/services/internal/middleware/guards';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { errors } from '@/services/internal/errors';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { mapUserSettings, profilePrivacyReverseMap, profileVisibilitySchema, userSettingsSchema } from '@/services/internal/contract/userSettings';
import type { UserSettingUpdateInput } from '@/prisma/models';

export const userSettingsRouter = createInternalApiRouter();

userSettingsRouter.get({
	path: '/users/@me/settings',
	name: 'users.me.settings.get',
	description: 'Get user settings',
	guard: guards.user,
	allowNotFound: true,
	schema: {
		response: userSettingsSchema
	},
	async handler({ auth }) {
		const account = auth!;
		if (!account.user || !account.user.settings) {
			throw errors.for('not_found');
		}

		return mapUserSettings(account.user.settings);
	}
});

userSettingsRouter.post({
	path: '/users/@me/settings',
	name: 'users.me.settings.update',
	description: 'Update user settings',
	guard: guards.user,
	schema: {
		body: z.object({
			profileVisibility: profileVisibilitySchema,
			countryVisible: z.boolean(),
			birthdayVisible: z.boolean(),
			gameSkillVisible: z.boolean(),
			comment: z.string().nullable()
		}),
		response: resultSchema
	},
	async handler({ body, auth, db }) {
		const account = auth!;
		const settings = account.user?.settings;
		if (!settings) {
			throw errors.for('not_found');
		}

		const data: UserSettingUpdateInput = {};
		data.profilePrivacy = profilePrivacyReverseMap[body.profileVisibility];
		data.isCountryVisible = body.countryVisible;
		data.isBirthdayVisible = body.birthdayVisible;
		data.isGameSkillVisible = body.gameSkillVisible;
		data.profileComment = body.comment ? body.comment : null;

		await db.userSetting.update({
			where: {
				pid: settings.pid
			},
			data
		});

		return mapResult('success');
	}
});
