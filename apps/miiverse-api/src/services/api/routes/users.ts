import express from 'express';
import { getValueFromQueryString, sendOliveXmlResult } from '@/util';
import { ApiErrorCode, badRequest } from '@/errors';
import { getDb, getUser } from '@/database';

const router = express.Router();

type NotificationResult = {
	request_name: 'notifications';
	notification_count: number;
};

/**
 * Endpoint data doesn't get read by the caller, it only reads the status code.
 * We provide a made-up response structure similar, third-parties may enjoy the data.
 */
router.get('/:pid/notifications', async function (request: express.Request, response: express.Response): Promise<void> {
	const pid = Number(getValueFromQueryString(request.query, 'pid')[0]);
	const user = await getUser(request.pid);

	if (!user) {
		return badRequest(response, ApiErrorCode.FAIL_NOT_FOUND_USER, 404);
	}

	if (pid !== user.pid) {
		return badRequest(response, ApiErrorCode.NOT_ALLOWED, 403);
	}

	const unreadNotifications = await getDb().notificationRecipient.count({
		where: {
			hasRead: false,
			pid: user.pid
		}
	});

	if (unreadNotifications === 0) {
		response.status(204).send();
		return;
	}

	sendOliveXmlResult<NotificationResult>(response, {
		request_name: 'notifications',
		notification_count: unreadNotifications
	});
});

export default router;
