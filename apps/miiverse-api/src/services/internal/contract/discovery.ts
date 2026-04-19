import { z } from 'zod';
import type { HydratedEndpointDocument } from '@/models/endpoint';

export const discoveryStatusSchema = z.enum(['open', 'maintenance', 'closed', 'unavailable']).openapi('DiscoveryStatus');
export type DiscoveryStatus = z.infer<typeof discoveryStatusSchema>;

export const discoverySchema = z.object({
	status: discoveryStatusSchema,
	guestAccess: z.boolean(),
	newUsers: z.boolean()
}).openapi('Discovery');
export type DiscoveryDto = z.infer<typeof discoverySchema>;

export function mapDiscovery(endpoint: HydratedEndpointDocument | null): DiscoveryDto {
	if (!endpoint) {
		return {
			status: 'unavailable',
			guestAccess: false,
			newUsers: false
		};
	}

	const statusMap: Record<number, DiscoveryStatus> = {
		3: 'maintenance',
		4: 'closed',
		0: 'open'
		// No idea what other status there are
	};

	return {
		status: statusMap[endpoint.status] ?? 'unavailable',
		guestAccess: endpoint.guest_access,
		newUsers: endpoint.new_users
	};
}
