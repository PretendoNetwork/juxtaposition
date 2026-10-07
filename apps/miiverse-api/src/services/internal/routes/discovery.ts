import { z } from 'zod';
import { guards } from '@/services/internal/middleware/guards';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { discoverySchema, mapDiscovery } from '@/services/internal/contract/discovery';
import { getEndpoint } from '@/database';
import { convertAccountServerAccessLevel } from '@/models/helpers';

export const discoveryRouter = createInternalApiRouter();

discoveryRouter.get({
	path: '/discovery/:environment',
	name: 'discovery.get',
	description: 'Get information about this current server',
	guard: guards.guest,
	schema: {
		params: z.object({
			environment: z.string()
		}),
		response: discoverySchema
	},
	async handler({ params }) {
		const serverAccessLevel = convertAccountServerAccessLevel(params.environment);
		const discovery = serverAccessLevel ? await getEndpoint(serverAccessLevel) : null;
		return mapDiscovery(discovery);
	}
});
