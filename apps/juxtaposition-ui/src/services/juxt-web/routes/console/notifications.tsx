import express from 'express';
import moment from 'moment';
import { z } from 'zod';
import { database } from '@/database';
import { getUserHash, getUserFriendRequestsIncoming } from '@/util';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
export const notificationRouter = express.Router();

notificationRouter.get('/my_news', async function (req, res) {
	const { query, auth } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional()
		})
	});

	const notifications = await database.getNotifications(auth().pid, 25, 0);
	const userMap = getUserHash();
	const bundle = {
		notifications,
		userMap
	};

	for (const notif of notifications.filter(noti => noti.read === false)) {
		// Pretty terrible use of `any` here, but database models aren't typed yet so I have to
		await (notif as any).markRead();
	}

	if (query.pjax) {
		return res.render(req.directory + '/partials/notifications.ejs', {
			bundle,
			moment
		});
	}

	res.render(req.directory + '/notifications.ejs', {
		moment,
		selection: 0,
		bundle,
		template: 'notifications'
	});
});

notificationRouter.get('/friend_requests', async function (req, res) {
	const { query, auth } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional()
		})
	});

	let requests = (await getUserFriendRequestsIncoming(auth().pid)).reverse();
	const now = new Date();
	requests = requests.filter(request => new Date(Number(request.expires) * 1000) > new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
	const userMap = getUserHash();
	const bundle = {
		requests: requests ? requests : [],
		userMap
	};

	if (query.pjax) {
		return res.render(req.directory + '/partials/requests.ejs', {
			bundle,
			moment
		});
	}

	res.render(req.directory + '/notifications.ejs', {
		moment,
		selection: 1,
		bundle,
		template: 'requests'
	});
});
