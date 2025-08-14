import * as express from 'express';
import * as moment from 'moment';
import * as database from '@/database';
import { getUserFriendRequestsIncoming } from '@/util';
export const notificationRouter = express.Router();

notificationRouter.get('/my_news', async function (req, res) {
	const notifications = await database.getNotifications(req.pid, 25, 0);
	const userMap = util.getUserHash();
	const bundle = {
		notifications,
		userMap
	};

	if (req.query.pjax) {
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
	notifications.filter(noti => noti.read === false).forEach(function (notification) {
		notification.markRead();
	});
});

notificationRouter.get('/friend_requests', async function (req, res) {
	let requests = (await getUserFriendRequestsIncoming(req.pid)).reverse();
	const now = new Date();
	requests = requests.filter(request => new Date(Number(request.expires) * 1000) > new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
	const userMap = util.getUserHash();
	const bundle = {
		requests: requests ? requests : [],
		userMap
	};

	if (req.query.pjax) {
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

export default notificationRouter;
