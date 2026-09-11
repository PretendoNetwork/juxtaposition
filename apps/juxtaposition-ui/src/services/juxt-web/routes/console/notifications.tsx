import express from 'express';
import { z } from 'zod';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebNotificationListView, WebNotificationWrapperView } from '@/services/juxt-web/views/web/notificationListView';
import { PortalNotificationListView, PortalNotificationWrapperView } from '@/services/juxt-web/views/portal/notificationListView';
import { CtrNotificationListView, CtrNotificationWrapperView } from '@/services/juxt-web/views/ctr/notificationListView';
import { PortalFriendRequestListView, PortalFriendRequestWrapperView } from '@/services/juxt-web/views/portal/friendRequestListView';
import { CtrFriendRequestListView, CtrFriendRequestWrapperView } from '@/services/juxt-web/views/ctr/friendRequestListView';
import { buildListLinks, buildListRemaining } from '@/services/juxt-web/views/web/listView';
import type { NotificationListViewProps } from '@/services/juxt-web/views/web/notificationListView';
import type { FriendRequestListViewProps } from '@/services/juxt-web/views/web/friendRequestListView';
export const notificationRouter = express.Router();

notificationRouter.get('/my_news', async function (req, res) {
	const { query } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional(),
			offset: z.coerce.number().optional().default(0)
		})
	});
	const offset = query.offset;

	const { data: notificationsPage } = await req.api.notifications.list({
		markAsRead: 'true',
		offset,
		limit: 25
	});
	const { items, total } = notificationsPage;

	// we do this *after* markAsRead: true, so we are seeing remaining counts
	const { data: notificationCounts } = await req.api.self.getNotifications();

	const props: NotificationListViewProps = {
		...buildListLinks('/news/my_news', offset, items.length),
		...buildListRemaining(offset, items.length, total),
		notifications: items,
		remainingUnreads: notificationCounts.unreadNotifications
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
	const { query } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional()
		})
	});

	const { data: requests } = await req.api.self.getFriendRequests();

	const props: FriendRequestListViewProps = {
		requests
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
