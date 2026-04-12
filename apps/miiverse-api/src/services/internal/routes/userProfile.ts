import { z } from 'zod';
import { deleteOptional } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { Settings } from '@/models/settings';
import { Content } from '@/models/content';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { errors } from '@/services/internal/errors';
import { createNewFollowNotification } from '@/services/internal/utils/notifications';
import type { FilterQuery } from 'mongoose';
import type { ISettings } from '@/types/mongoose/settings';

export const userProfileRouter = createInternalApiRouter();

function notBanned() {
	return { account_status: { $in: [0, 1] } };
}

userProfileRouter.get({
	path: '/users/:id/followers',
	name: 'users.listFollowers',
	description: 'Get a list of who is following the target user',
	guard: guards.guest,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		query: z.object(pageControlSchema(100)),
		response: pageDtoSchema(shallowUserSchema)
	},
	async handler({ params, query }) {
		const targetUser = await Settings.findOne({ pid: params.id });
		const targetUserContent = await Content.findOne({ pid: params.id });
		if (!targetUser) {
			return mapPage(0, []);
		}

		// User contents frequently have a `0` element in it
		const targetPids = (targetUserContent?.following_users ?? []).filter(v => v !== 0);

		const dbQuery: FilterQuery<ISettings> = deleteOptional({
			pid: {
				$in: targetPids
			},
			...notBanned()
		});
		const items = await Settings
			.find(dbQuery)
			.sort({ pid: -1 })
			.skip(query.offset)
			.limit(query.limit);
		const total = await Settings.countDocuments(dbQuery);

		return mapPage(total, items.map(mapShallowUser));
	}
});

userProfileRouter.get({
	path: '/users/:id/following',
	name: 'users.listFollowing',
	description: 'Get a list of who the target user is following',
	guard: guards.guest,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		query: z.object(pageControlSchema(100)),
		response: pageDtoSchema(shallowUserSchema)
	},
	async handler({ params, query }) {
		const targetUser = await Settings.findOne({ pid: params.id });
		const targetUserContent = await Content.findOne({ pid: params.id });
		if (!targetUser) {
			return mapPage(0, []);
		}

		// User contents frequently have a `0` element in it
		const targetPids = (targetUserContent?.followed_users ?? []).filter(v => v !== 0);

		const dbQuery: FilterQuery<ISettings> = deleteOptional({
			pid: {
				$in: targetPids
			},
			...notBanned()
		});
		const items = await Settings
			.find(dbQuery)
			.sort({ pid: -1 })
			.skip(query.offset)
			.limit(query.limit);
		const total = await Settings.countDocuments(dbQuery);

		return mapPage(total, items.map(mapShallowUser));
	}
});

userProfileRouter.post({
	path: '/users/:id/followers/@me',
	name: 'users.followerUser',
	guard: guards.user,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		response: resultSchema
	},
	async handler({ params, auth }) {
		const currentUser = auth!;
		const currentUserPid = currentUser.pnid.pid;

		const targetUserContent = await Content.findOne({ pid: params.id });
		const currentUserContent = await Content.findOne({ pid: currentUserPid });
		if (!targetUserContent || !currentUserContent) {
			throw new errors.notFound();
		}

		const currentUserFollowedUsers = currentUserContent.followed_users;
		const isFollowing = currentUserFollowedUsers.includes(targetUserContent.pid);
		if (isFollowing) {
			return mapResult('success');
		}

		targetUserContent.following_users.push(currentUserPid);
		currentUserContent.followed_users.push(targetUserContent.pid);
		await targetUserContent.save();
		await currentUserContent.save();

		await createNewFollowNotification({ currentUser: currentUserPid, userToFollow: targetUserContent.pid });
		return mapResult('success');
	}
});

userProfileRouter.delete({
	path: '/users/:id/followers/@me',
	name: 'users.followerUser',
	guard: guards.user,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		response: resultSchema
	},
	async handler({ params, auth }) {
		const currentUser = auth!;
		const currentUserPid = currentUser.pnid.pid;

		const targetUserContent = await Content.findOne({ pid: params.id });
		const currentUserContent = await Content.findOne({ pid: currentUserPid });
		if (!targetUserContent || !currentUserContent) {
			throw new errors.notFound();
		}

		const currentUserFollowedUsers = currentUserContent.followed_users;
		const isFollowing = currentUserFollowedUsers.includes(targetUserContent.pid);
		if (!isFollowing) {
			return mapResult('success');
		}

		targetUserContent.following_users = targetUserContent.following_users.filter(pid => pid !== currentUserPid);
		currentUserContent.followed_users = currentUserContent.followed_users.filter(pid => pid !== targetUserContent.pid);
		await targetUserContent.save();
		await currentUserContent.save();

		return mapResult('success');
	}
});
