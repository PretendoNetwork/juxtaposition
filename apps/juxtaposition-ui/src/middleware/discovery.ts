import { database as db } from '@/database';
import { config } from '@/config';
import type { RequestHandler } from 'express';

export const checkDiscovery: RequestHandler = async (request, response, next) => {
	const discovery = await db.getEndPoint(config.serverEnvironment);

	if (!discovery || discovery.status !== 0) {
		let message = '';
		const status = discovery ? discovery.status : -1;
		switch (status) {
			case 3:
				message = 'Juxtaposition is currently under maintenance. Please try again later.';
				break;
			case 4:
				message = 'Juxtaposition is now closed. Thank you for your support!';
				break;
			default:
				message = 'Juxtaposition is currently unavailable. Please try again later.';
				break;
		}
		if (request.directory === 'web') {
			return response.render('web/login.ejs', { toast: message, redirect: request.originalUrl });
		} else {
			return response.render('portal/error_fatal.ejs', {
				message,
				code: 5989999
			});
		}
	} else {
		request.guest_access = discovery ? discovery.guest_access : false;
		request.new_users = discovery ? discovery.new_users : false;
		response.locals.cdnURL = config.cdnDomain;
	}

	next();
};
