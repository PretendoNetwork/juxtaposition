import express from 'express';
import moment from 'moment';
import { z } from 'zod';
import { database } from '@/database';
import { getUserHash, getUserFriendRequestsIncoming } from '@/util';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebNotificationListView, WebNotificationWrapperView } from '@/services/juxt-web/views/web/notificationListView';
import { buildContext } from '@/services/juxt-web/views/context';
import { PortalNotificationListView, PortalNotificationWrapperView } from '@/services/juxt-web/views/portal/notificationListView';
import { CtrNotificationListView, CtrNotificationWrapperView } from '@/services/juxt-web/views/ctr/notificationListView';
import type { NotificationListViewProps } from '@/services/juxt-web/views/web/notificationListView';
export const notificationRouter = express.Router();

notificationRouter.get('/my_news', async function (req, res) {
	const { query, auth } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional()
		})
	});

	const notifications = await database.getNotifications(auth().pid, 25, 0);
	for (const notif of notifications.filter(noti => noti.read === false)) {
		// Pretty terrible use of `any` here, but database models aren't typed yet so I have to
		await (notif as any).markRead();
	}

	const props: NotificationListViewProps = {
		ctx: buildContext(res),
		notifications
	};

	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebNotificationListView {...props} />,
			portal: <PortalNotificationListView {...props} />,
			ctr: <CtrNotificationListView {...props} />
		});
	}

	res.jsxForDirectory({
		web: (
			<WebNotificationWrapperView ctx={props.ctx} selectedTab={0}>
				<WebNotificationListView {...props} />
			</WebNotificationWrapperView>
		),
		portal: (
			<PortalNotificationWrapperView ctx={props.ctx} selectedTab={0}>
				<PortalNotificationListView {...props} />
			</PortalNotificationWrapperView>
		),
		ctr: (
			<CtrNotificationWrapperView ctx={props.ctx} selectedTab={0}>
				<CtrNotificationListView {...props} />
			</CtrNotificationWrapperView>
		)
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
