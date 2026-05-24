import { z } from 'zod';
import { guards } from '@/services/internal/middleware/guards';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { pageControlSchema } from '@/services/internal/contract/page';
import { Settings } from '@/models/settings';
import { errors } from '@/services/internal/errors';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { Content } from '@/models/content';

export const onboardingRouter = createInternalApiRouter();

onboardingRouter.post({
	path: '/onboarding/submit',
	name: 'onboarding.submit',
	guard: guards.guest, // Needs auth, but normal guards check for onboarding
	schema: {
		body: z.object({
			experienceId: z.number(),
			receiveNotifications: z.boolean()
		}).extend(pageControlSchema()),
		response: resultSchema
	},
	async handler({ body, auth }) {
		if (!auth) {
			// Needs an auth token
			throw errors.for('requires_auth');
		}

		if (auth.settings && auth.content) {
			// Already completed the full onboarding process
			return mapResult('success');
		}

		const name = auth.pnid.mii?.name ?? 'Default';
		if (!auth.settings) {
			await Settings.create({
				pid: auth.pnid.pid,
				screen_name: name,
				game_skill: body.experienceId,
				receive_notifications: body.receiveNotifications
			});
		}
		if (!auth.content) {
			await Content.create({
				pid: auth.pnid.pid
			});
		}

		return mapResult('success');
	}
});
