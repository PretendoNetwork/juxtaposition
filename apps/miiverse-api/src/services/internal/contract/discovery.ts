import { z } from 'zod';
import type { DiscoveryEndpoint } from '@/prisma/client';

export const discoveryStatusSchema = z.enum(['open', 'maintenance', 'closed', 'unavailable']).openapi('DiscoveryStatus');
export type DiscoveryStatus = z.infer<typeof discoveryStatusSchema>;

export const discoverySchema = z.object({
	status: discoveryStatusSchema
}).openapi('Discovery');
export type DiscoveryDto = z.infer<typeof discoverySchema>;

export function mapDiscovery(endpoint: DiscoveryEndpoint | null): DiscoveryDto {
	if (!endpoint) {
		return {
			status: 'unavailable'
		};
	}

	const statusMap: Record<number, DiscoveryStatus> = {
		3: 'maintenance',
		4: 'closed',
		0: 'open'
		// No idea what other status there are
	};

	return {
		status: statusMap[endpoint.status] ?? 'unavailable'
	};
}
