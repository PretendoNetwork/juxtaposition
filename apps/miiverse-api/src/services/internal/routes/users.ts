import express from 'express';
import * as z from 'zod/v4';
import { errors } from '@/services/internal/errors';
import { handle } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { Settings } from '@/models/settings';
import { mapUserSetttings } from '@/services/internal/contract/settings';
import { pidOrSelfSchema } from '@/services/internal/schemas';

export const usersRouter = express.Router();

usersRouter.get('/users/:user/profile/settings', guards.user, handle(async ({ req, res }) => {
	const params = z.object({
		user: pidOrSelfSchema
	}).parse(req.params);

	// guards.user makes this safe
	const account = res.locals.account!;

	let user: number | null = null;
	if (params.user === '@me') {
		user = account.pnid.pid;
	} else if (account.moderator) {
		user = params.user;
	} else {
		throw new errors.forbidden('Permission denied');
	}

	const userSettings = await Settings.findOne({
		pid: user
	});
	if (userSettings === null) {
		throw new errors.notFound('User not found (or profile setup not complete)');
	}

	// UserSettingsDto
	return mapUserSetttings(userSettings);
}));
