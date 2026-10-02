import express from 'express';
import xmlbuilder from 'xmlbuilder';
import { getEndpoint } from '@/database';
import { ApiErrorCode, badRequest, serverError } from '@/errors';
import type { DiscoveryEndpoint } from '@/prisma/client';

const router = express.Router();

/* GET discovery server. */
router.get('/', async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	let discovery: DiscoveryEndpoint | null;

	if (request.user) {
		discovery = await getEndpoint(request.user.serverAccessLevel);
	} else {
		discovery = await getEndpoint('prod');
	}

	if (!discovery) {
		request.log.error(`Discovery data is missing for ${request.user?.serverAccessLevel}`);
		return serverError(response, ApiErrorCode.NO_DISCOVERY_DATA);
	}

	if (discovery.status > 0 && discovery.status <= 7) {
		return badRequest(response, discovery.status);
	} else if (discovery.status !== 0) {
		request.log.error(`Discovery status ${discovery.status} unexpected for ${request.user?.serverAccessLevel}`);
		return serverError(response, ApiErrorCode.NO_DISCOVERY_DATA);
	}

	response.send(xmlbuilder.create({
		result: {
			has_error: 0,
			version: 1,
			endpoint: {
				host: discovery.apiHost,
				api_host: discovery.apiHost,
				portal_host: discovery.wupHost,
				n3ds_host: discovery.ctrHost
			}
		}
	}).end({ pretty: true }));
});

export default router;
