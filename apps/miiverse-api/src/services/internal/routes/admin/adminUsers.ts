import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import { buildSearchQuery } from '@/services/internal/utils/search';
import { Settings } from '@/models/settings';
import type { FilterQuery } from 'mongoose';
import type { ISettings } from '@/types/mongoose/settings';

export const adminUsersRouter = createInternalApiRouter();

adminUsersRouter.get({
	path: '/admin/users',
	name: 'admin.users.list',
	guard: guards.moderator,
	schema: {
		query: z.object({
			search: z.string().optional()
		}).extend(pageControlSchema()),
		response: pageDtoSchema(shallowUserSchema)
	},
	async handler({ query }) {
		const dbQuery: FilterQuery<ISettings> = query.search ? buildSearchQuery(['pid', 'screen_name'], query.search) : {};
		const users = await Settings
			.find(dbQuery)
			.limit(query.limit)
			.skip(query.offset);
		const total = await Settings.countDocuments(dbQuery);

		return mapPage(total, users.map(v => mapShallowUser(v)));
	}
});
