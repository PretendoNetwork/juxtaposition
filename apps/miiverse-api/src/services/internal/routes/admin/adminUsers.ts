import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { mapShallowUser, shallowUserSchema, userProfileSchema } from '@/services/internal/contract/user';
import { buildSearchQuery } from '@/services/internal/utils/search';
import { Settings } from '@/models/settings';
import { Post } from '@/models/post';
import { errors } from '@/services/internal/errors';
import { getUserAccountData } from '@/util';
import { Content } from '@/models/content';
import { mapModerationProfile, moderationProfileSchema } from '@/services/internal/contract/admin/moderationProfile';
import { mapAdminUserProfile } from '@/services/internal/contract/admin/adminUsers';
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

adminUsersRouter.get({
	path: '/admin/users/:id/profile',
	name: 'admin.users.getProfile',
	description: 'Get profile information with admin rights',
	guard: guards.moderator,
	allowNotFound: true,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		response: userProfileSchema
	},
	async handler({ params }) {
		const settings = await Settings.findOne({ pid: params.id });
		const content = await Content.findOne({ pid: params.id });
		const pnid = await getUserAccountData(params.id).catch(() => {
			return null;
		});
		if (!settings || !content || !pnid) {
			throw new errors.notFound('Not found');
		}

		const followers = content.following_users.filter(v => v !== 0).length;
		const totalPosts = await Post.find({
			pid: params.id,
			parent: null,
			message_to_pid: null,
			removed: false
		}).countDocuments();

		return mapAdminUserProfile(settings, pnid, followers, totalPosts);
	}
});

adminUsersRouter.get({
	path: '/admin/users/:id/mod-profile',
	name: 'admin.users.getModProfile',
	description: 'Get moderation profile of a user',
	guard: guards.moderator,
	allowNotFound: true,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		response: moderationProfileSchema
	},
	async handler({ params }) {
		const settings = await Settings.findOne({ pid: params.id });
		if (!settings) {
			throw new errors.notFound('Not found');
		}

		return mapModerationProfile(settings);
	}
});
