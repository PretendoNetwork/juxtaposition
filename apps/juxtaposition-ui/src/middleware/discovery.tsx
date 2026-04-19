import { config } from '@/config';
import { WebLoginView } from '@/services/juxt-web/views/web/loginView';
import { PortalFatalErrorView } from '@/services/juxt-web/views/portal/errorView';
import { CtrFatalErrorView } from '@/services/juxt-web/views/ctr/errorView';
import { createInternalApiClient } from '@/api/client';
import type { RequestHandler } from 'express';
import type { DiscoveryStatus } from '@/api/generated';

export const checkDiscovery: RequestHandler = async (request, response, next) => {
	const api = createInternalApiClient({});
	const { data: discovery } = await api.discovery.get({ environment: config.serverEnvironment });
	const status = discovery.status;

	if (status !== 'open') {
		const messageMap: Record<DiscoveryStatus, string> = {
			closed: 'Juxtaposition is now closed. Thank you for your support!',
			maintenance: 'Juxtaposition is currently under maintenance. Please try again later.',
			open: '', // impossible
			unavailable: 'Juxtaposition is currently unavailable. Please try again later.'
		};
		const message = messageMap[status];
		return response.jsxForDirectory({
			web: <WebLoginView toast={message} redirect={request.originalUrl} />,
			portal: <PortalFatalErrorView code={5989999} message={message} />,
			ctr: <CtrFatalErrorView code={5989999} message={message} />
		});
	}

	request.guest_access = discovery.guestAccess;
	request.new_users = discovery.newUsers;
	response.locals.cdnURL = config.cdnDomain;

	next();
};
