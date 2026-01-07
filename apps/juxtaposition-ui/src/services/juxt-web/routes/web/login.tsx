import express from 'express';
import { database } from '@/database';
import { passwordLogin, getUserDataFromToken } from '@/util';
import { config } from '@/config';
import { logger } from '@/logger';

export const loginRouter = express.Router();
const cookieDomain = config.http.cookieDomain;

loginRouter.get('/', async function (req, res) {
	res.render(req.directory + '/login.ejs', { toast: null, redirect: req.query.redirect ?? '/' });
});

loginRouter.post('/', async (req, res) => {
	const { username, password, redirect } = req.body;
	const login = await passwordLogin(username, password).catch((e) => {
		switch (e.details) {
			case 'INVALID_ARGUMENT: User not found':
				res.render(req.directory + '/login.ejs', { toast: 'Username was invalid.', redirect });
				break;
			case 'INVALID_ARGUMENT: Password is incorrect':
				res.render(req.directory + '/login.ejs', { toast: 'Password was incorrect.', redirect });
				break;
			default:
				logger.error(e, `Login error for ${username}`);
				res.render(req.directory + '/login.ejs', { toast: 'Invalid username or password.', redirect });
				break;
		}
	});
	if (!login) {
		return;
	}

	const PNID = await getUserDataFromToken(login.accessToken);
	if (!PNID) {
		return res.render(req.directory + '/login.ejs', { toast: 'Invalid username or password.', redirect });
	}

	const discovery = await database.getEndPoint(config.serverEnvironment);
	const discoveryStatus = discovery?.status ?? 5;

	let message = '';
	switch (discoveryStatus) {
		case 3:
			message = 'Juxt is currently undergoing maintenance. Please try again later.';
			break;
		case 4:
			message = 'Juxt is currently closed. Thank you for your interest.';
			break;
		default:
			message = 'Juxt is currently unavailable. Please try again later.';
			break;
	}
	if (discoveryStatus !== 0) {
		return res.render(req.directory + '/error.ejs', {
			code: 504,
			message: message
		});
	}
	const expiration = login.expiresIn * 60 * 60;

	res.cookie('access_token', login.accessToken, { domain: cookieDomain, maxAge: expiration });
	res.cookie('refresh_token', login.refreshToken, { domain: cookieDomain });
	res.cookie('token_type', 'Bearer', { domain: cookieDomain });

	/* Only allow relative URLs (leading /) or absolute ones on config.http.baseUrl. */
	const safe_redirect = new URL(redirect, config.http.baseUrl).origin == config.http.baseUrl ? redirect : '/';

	res.redirect(safe_redirect);
});
