import { z } from 'zod';
import { guards } from '@/services/internal/middleware/guards';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { errors } from '@/services/internal/errors';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { mapUserSettings, profileVisibilitySchema, userSettingsSchema } from '@/services/internal/contract/userSettings';

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
		if (!account.settings) {
			throw errors.for('not_found');
		}

		return mapUserSettings(account.settings);
	}
});

userSettingsRouter.post({
	path: '/users/@me/settings',
	name: 'users.me.settings.update',
	description: 'Get user settings',
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
	async handler({ body, auth }) {
		const account = auth!;
		const settings = account.settings;
		if (!settings) {
			throw errors.for('not_found');
		}

		settings.profile_visibility = body.profileVisibility;
		settings.country_visibility = body.countryVisible;
		settings.birthday_visibility = body.birthdayVisible;
		settings.game_skill_visibility = body.gameSkillVisible;

		if (body.comment) {
			settings.profile_comment_visibility = true;
			settings.profile_comment = body.comment;
		} else {
			settings.profile_comment_visibility = false;
			settings.profile_comment = '';
		}

		return mapResult('success');
	}
});
