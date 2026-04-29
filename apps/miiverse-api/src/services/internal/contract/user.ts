import { z } from 'zod';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

export const shallowUserSchema = z.object({
	pid: z.number(),
	miiName: z.string(),
	accountStatus: z.number()
}).openapi('ShallowUser');

export type ShallowUserDto = z.infer<typeof shallowUserSchema>;

export function mapShallowUser(settings: HydratedSettingsDocument): ShallowUserDto {
	return {
		pid: settings.pid,
		accountStatus: settings.account_status,
		miiName: settings.screen_name
	};
}
