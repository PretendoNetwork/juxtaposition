import express from 'express';
import { z } from 'zod';
import { database } from '@/database';
import { getUserFriendRequestsIncoming } from '@/util';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebNotificationListView, WebNotificationWrapperView } from '@/services/juxt-web/views/web/notificationListView';
import { PortalNotificationListView, PortalNotificationWrapperView } from '@/services/juxt-web/views/portal/notificationListView';
import { CtrNotificationListView, CtrNotificationWrapperView } from '@/services/juxt-web/views/ctr/notificationListView';
import { PortalFriendRequestListView, PortalFriendRequestWrapperView } from '@/services/juxt-web/views/portal/friendRequestListView';
import { CtrFriendRequestListView, CtrFriendRequestWrapperView } from '@/services/juxt-web/views/ctr/friendRequestListView';
import type { NotificationListViewProps } from '@/services/juxt-web/views/web/notificationListView';
import type { FriendRequestListViewProps } from '@/services/juxt-web/views/web/friendRequestListView';
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
			<WebNotificationWrapperView>
				<WebNotificationListView {...props} />
			</WebNotificationWrapperView>
		),
		portal: (
			<PortalNotificationWrapperView>
				<PortalNotificationListView {...props} />
			</PortalNotificationWrapperView>
		),
		ctr: (
			<CtrNotificationWrapperView>
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

	const now = new Date();
	const allRequests = (await getUserFriendRequestsIncoming(auth().pid)).reverse();
	const validRequests = allRequests.filter(request => new Date(Number(request.expires) * 1000) > new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));

	const props: FriendRequestListViewProps = {
		requests: validRequests
	};

	if (query.pjax) {
		return res.jsxForDirectory({
			portal: <PortalFriendRequestListView {...props} />,
			ctr: <CtrFriendRequestListView {...props} />
		});
	}

	res.jsxForDirectory({
		portal: (
			<PortalFriendRequestWrapperView>
				<PortalFriendRequestListView {...props} />
			</PortalFriendRequestWrapperView>
		),
		ctr: (
			<CtrFriendRequestWrapperView>
				<CtrFriendRequestListView {...props} />
			</CtrFriendRequestWrapperView>
		)
	});
});
