import { z } from 'zod';
import { deleteOptional } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { mapShallowUser, mapUserProfile, shallowUserSchema, userProfileSchema } from '@/services/internal/contract/user';
import { errors } from '@/services/internal/errors';
import { createNewFollowNotification } from '@/services/internal/utils/notifications';
import { getUserAccountData, getUserFriendPIDs } from '@/util';
import { Post } from '@/models/post';
import { communitySchema, mapCommunity } from '@/services/internal/contract/community';
import { COMMUNITY_TYPE } from '@/types/mongoose/community';
import { Community } from '@/models/community';
import { followSchema, mapFollowUser } from '@/services/internal/contract/follow';
import { assertCanAccessUser, canAccessUser } from '@/services/internal/utils/user';
import type { FilterQuery } from 'mongoose';
import type { ICommunity } from '@/types/mongoose/community';
import type { UserFollowWhereInput, UserWhereInput } from '@/prisma/models';

export const userProfileRouter = createInternalApiRouter();

function notBannedUserQuery(query?: UserWhereInput): UserWhereInput {
	const queries: UserWhereInput[] = [
		{ accountStatus: { in: [0, 1] } }
	];
	if (query) {
		queries.push(query);
	}
	return {
		AND: queries
	};
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
	async handler({ params, auth, db }) {
		const pid = params.id;
		const user = await db.user.findUnique({
			where: {
				pid
			},
			include: {
				settings: true
			}
		});
		const pnid = await getUserAccountData(pid);
		if (!user || !pnid || pnid.deleted) {
			throw errors.for('not_found');
		}

		assertCanAccessUser(auth, user);
		if (pnid.accessLevel < 0) {
			throw errors.for('user_banned');
		}

		const followers = await db.userFollow.count({
			where: {
				followingPid: user.pid
			}
		});
		const totalPosts = await Post.find({
			pid: params.id,
			parent: null,
			message_to_pid: null,
			removed: false
		}).countDocuments();

		return mapUserProfile(user, pnid, followers, totalPosts);
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
	async handler({ params, query, auth, db }) {
		const pid = params.id;
		const user = await db.user.findUnique({
			where: {
				pid
			},
			include: {
				settings: true
			}
		});
		if (!user) {
			throw errors.for('not_found');
		}

		assertCanAccessUser(auth, user);

		const targetPids = await getUserFriendPIDs(pid);
		const dbQuery = notBannedUserQuery({
			pid: {
				in: targetPids
			}
		});
		const items = await db.user.findMany({
			where: dbQuery,
			orderBy: {
				pid: 'desc'
			},
			skip: query.offset,
			take: query.limit
		});
		const total = await db.user.count({
			where: dbQuery
		});

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
	async handler({ params, query, auth, db }) {
		const pid = params.id;
		const user = await db.user.findUnique({
			where: {
				pid
			},
			include: {
				settings: true
			}
		});
		if (!user || !canAccessUser(auth, user)) {
			return mapPage(0, []);
		}

		const dbQuery: UserFollowWhereInput = {
			followingPid: user.pid,
			user: notBannedUserQuery()
		};
		const items = await db.userFollow.findMany({
			where: dbQuery,
			include: {
				user: true
			},
			orderBy: {
				pid: 'desc'
			},
			skip: query.offset,
			take: query.limit
		});
		const total = await db.userFollow.count({
			where: dbQuery
		});

		return mapPage(total, items.map(v => mapShallowUser(v.user)));
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
	async handler({ params, query, auth, db }) {
		const pid = params.id;
		const user = await db.user.findUnique({
			where: {
				pid
			},
			include: {
				settings: true
			}
		});
		if (!user || !canAccessUser(auth, user)) {
			return mapPage(0, []);
		}

		const followedComms = await db.communityFollow.findMany({
			where: {
				pid
			}
		});

		const dbQuery: FilterQuery<ICommunity> = deleteOptional({
			olive_community_id: {
				$in: followedComms.map(v => v.communityId)
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
	async handler({ params, query, auth, db }) {
		const pid = params.id;
		const user = await db.user.findUnique({
			where: {
				pid
			},
			include: {
				settings: true
			}
		});
		if (!user || !canAccessUser(auth, user)) {
			return mapPage(0, []);
		}

		const dbQuery: UserFollowWhereInput = {
			pid: user.pid,
			followingUser: notBannedUserQuery()
		};
		const items = await db.userFollow.findMany({
			where: dbQuery,
			include: {
				followingUser: true
			},
			orderBy: {
				pid: 'desc'
			},
			skip: query.offset,
			take: query.limit
		});
		const total = await db.userFollow.count({
			where: dbQuery
		});

		return mapPage(total, items.map(v => mapShallowUser(v.followingUser)));
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
		response: followSchema
	},
	async handler({ params, auth, db }) {
		const targetUserPid = params.id;
		const targetUser = await db.user.findUnique({
			where: {
				pid: targetUserPid
			},
			include: {
				settings: true
			}
		});
		const targetFollowCount = await db.userFollow.count({
			where: {
				followingPid: targetUserPid
			}
		});
		if (!targetUser) {
			throw errors.for('not_found');
		}

		assertCanAccessUser(auth, targetUser);

		const currentUser = auth!;
		const currentUserPid = currentUser.pnid.pid;
		const existingFollow = await db.userFollow.findFirst({
			where: {
				pid: currentUserPid,
				followingPid: targetUserPid
			}
		});
		if (existingFollow) {
			return mapFollowUser('follow', targetUserPid, targetFollowCount);
		}

		await db.userFollow.create({
			data: {
				pid: currentUserPid,
				followingPid: targetUserPid
			}
		});

		await createNewFollowNotification(db, { currentUser: currentUserPid, userToFollow: targetUserPid });
		return mapFollowUser('follow', targetUserPid, targetFollowCount + 1);
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
		response: followSchema
	},
	async handler({ params, auth, db }) {
		const targetUserPid = params.id;
		const targetUser = await db.user.findUnique({
			where: {
				pid: targetUserPid
			},
			include: {
				settings: true
			}
		});
		const targetFollowCount = await db.userFollow.count({
			where: {
				followingPid: targetUserPid
			}
		});
		if (!targetUser) {
			throw errors.for('not_found');
		}

		assertCanAccessUser(auth, targetUser);

		const currentUser = auth!;
		const currentUserPid = currentUser.pnid.pid;

		const existingFollow = await db.userFollow.findFirst({
			where: {
				pid: currentUserPid,
				followingPid: targetUserPid
			}
		});
		if (!existingFollow) {
			return mapFollowUser('unfollow', targetUserPid, targetFollowCount);
		}

		await db.userFollow.delete({
			where: {
				pid: currentUserPid,
				followingPid: targetUserPid
			}
		});
		return mapFollowUser('unfollow', targetUserPid, targetFollowCount - 1);
	}
});
