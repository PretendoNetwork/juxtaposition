import { z } from 'zod';
import { guards } from '@/services/internal/middleware/guards';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { pageControlSchema } from '@/services/internal/contract/page';
import { errors } from '@/services/internal/errors';
import { mapResult, resultSchema } from '@/services/internal/contract/result';

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
	async handler({ body, auth, db }) {
		if (!auth) {
			// Needs an auth token
			throw errors.for('requires_auth');
		}

		if (auth.user) {
			// Already completed the full onboarding process
			return mapResult('success');
		}

		const name = auth.pnid.mii?.name ?? 'Default';
		if (!auth.user) {
			await db.user.create({
				data: {
					pid: auth.pnid.pid,
					displayName: name,
					accountStatus: 0,
					lastSeen: new Date(),
					settings: {
						create: {
							gameSkill: body.experienceId,
							receiveNotifications: body.receiveNotifications,
							isFavouriteCommunityVisible: true,
							isGameSkillVisible: true,
							profilePrivacy: 'Public',
							isBirthdayVisible: false,
							isRelationshipVisible: false,
							isCountryVisible: false,
							profileComment: null,
							notifyEmpathy: true,
							notifyFollows: true,
							notifyReply: true
						}
					}
				}
			});
		}

		return mapResult('success');
	}
});
