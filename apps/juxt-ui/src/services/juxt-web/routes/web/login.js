const express = require('express');
const router = express.Router();
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');

router.get('/', async function (req, res) {
	res.render(req.directory + '/login.ejs', { toast: null });
});

router.post('/', async (req, res) => {
	const { username, password } = req.body;
	const login = await util.login(username, password).catch((e) => {
		console.error(e.details);
		switch (e.details) {
			case 'INVALID_ARGUMENT: User not found':
				res.render(req.directory + '/login.ejs', { toast: 'Username was invalid.' });
				break;
			case 'INVALID_ARGUMENT: Password is incorrect':
				res.render(req.directory + '/login.ejs', { toast: 'Password was incorrect.' });
				break;
			default:
				res.render(req.directory + '/login.ejs', { toast: 'Invalid username or password.' });
				break;
		}
	});
	if (!login) {
		return;
	}

	const PNID = await util.getUserDataFromToken(login.accessToken);
	if (!PNID) {
		return res.render(req.directory + '/login.ejs', { toast: 'Invalid username or password.' });
	}

	let discovery = await database.getEndPoint(config.server_environment);
	if (!discovery) {
		discovery = {
			status: 5
		};
	}
	let message = '';
	switch (discovery.status) {
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
	if (discovery.status !== 0) {
		return res.render(req.directory + '/error.ejs', {
			code: 504,
			message: message
		});
	}
	const cookieDomain = (req.hostname.indexOf('miiverse') !== -1) ? '.miiverse.cc' : '.pretendo.network';
	const expiration = (req.hostname.indexOf('miiverse') !== -1) ? login.expiresIn * 60 * 60 * 24 : login.expiresIn * 60 * 60;
	res.cookie('access_token', login.accessToken, { domain: cookieDomain, maxAge: expiration });
	res.cookie('refresh_token', login.refreshToken, { domain: cookieDomain });
	res.cookie('token_type', 'Bearer', { domain: cookieDomain });
	res.redirect('/');
});

module.exports = router;
