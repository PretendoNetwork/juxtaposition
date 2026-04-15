import { z } from 'zod';
import { deleteOptional } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { Settings } from '@/models/settings';
import { Content } from '@/models/content';
import { mapShallowUser, mapUserProfile, shallowUserSchema, userProfileSchema } from '@/services/internal/contract/user';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { errors } from '@/services/internal/errors';
import { createNewFollowNotification } from '@/services/internal/utils/notifications';
import { getUserAccountData, getUserFriendPIDs } from '@/util';
import { Post } from '@/models/post';
import { communitySchema, mapCommunity } from '@/services/internal/contract/community';
import { COMMUNITY_TYPE } from '@/types/mongoose/community';
import { Community } from '@/models/community';
import type { FilterQuery } from 'mongoose';
import type { ICommunity } from '@/types/mongoose/community';
import type { ISettings } from '@/types/mongoose/settings';

export const userProfileRouter = createInternalApiRouter();

function notBanned() {
	return { account_status: { $in: [0, 1] } };
}

userProfileRouter.get({
	path: '/users/:id/profile',
	name: 'users.getProfile',
	description: 'Get a profile information for user',
	guard: guards.guest,
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

		const isUserBanned = (settings.account_status < 0 || settings.account_status > 1 || pnid.accessLevel < 0);
		const isUserDeleted = pnid.deleted;
		const isUserDataViewable = !isUserBanned && !isUserDeleted;

		// TODO handle this better?
		if (!isUserDataViewable) {
			throw new errors.notFound('Not found');
		}

		const followers = content.following_users.filter(v => v !== 0).length;
		const totalPosts = await Post.find({
			pid: params.id,
			parent: null,
			message_to_pid: null,
			removed: false
		}).countDocuments();

		return mapUserProfile(settings, pnid, followers, totalPosts);
	}
});

userProfileRouter.get({
	path: '/users/:id/friends',
	name: 'users.listFriends',
	guard: guards.guest,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		query: z.object(pageControlSchema(100)),
		response: pageDtoSchema(shallowUserSchema)
	},
	async handler({ params, query }) {
		const targetPids = await getUserFriendPIDs(params.id);
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
	path: '/users/:id/followed-communities',
	name: 'users.listFollowedCommunities',
	description: 'Get a list of which communities the target user is following',
	guard: guards.guest,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		query: z.object(pageControlSchema(100)),
		response: pageDtoSchema(communitySchema)
	},
	async handler({ params, query }) {
		const targetUser = await Settings.findOne({ pid: params.id });
		const targetUserContent = await Content.findOne({ pid: params.id });
		if (!targetUser) {
			return mapPage(0, []);
		}

		// User contents frequently have a `0` element in it
		const targetCommunities = (targetUserContent?.followed_communities ?? []).filter(v => v !== '0');

		const dbQuery: FilterQuery<ICommunity> = deleteOptional({
			olive_community_id: {
				$in: targetCommunities
			},
			type: {
				$ne: COMMUNITY_TYPE.Private
			}
		});
		const communities = await Community
			.find(dbQuery)
			.sort({ created_at: -1 })
			.skip(query.offset)
			.limit(query.limit);
		const total = await Community.countDocuments(dbQuery);

		return mapPage(total, communities.map(c => mapCommunity(c)));
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
		query: z.object({
			followerId: z.coerce.number().optional()
		}).extend(pageControlSchema(100)),
		response: pageDtoSchema(shallowUserSchema)
	},
	async handler({ params, query }) {
		const targetUser = await Settings.findOne({ pid: params.id });
		const targetUserContent = await Content.findOne({ pid: params.id });
		if (!targetUser) {
			return mapPage(0, []);
		}

		// User contents frequently have a `0` element in it
		let targetPids = (targetUserContent?.followed_users ?? []).filter(v => v !== 0);
		if (query.followerId) {
			targetPids = targetPids.filter(v => v === query.followerId);
		}

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
	name: 'users.unfollowUser',
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
