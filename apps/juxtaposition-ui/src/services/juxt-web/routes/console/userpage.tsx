import express from 'express';
import moment from 'moment';
import multer from 'multer';
import { z } from 'zod';
import { getPostsByEmpathy, getPostsByPoster } from '@/api/post';
import { database } from '@/database';
import { logger } from '@/logger';
import { POST } from '@/models/post';
import { SETTINGS } from '@/models/settings';
import { getCommunityHash, getUserAccountData, getUserFriendPIDs, newNotification } from '@/util';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebUserPageView } from '@/services/juxt-web/views/web/userPageView';
import { buildContext } from '@/services/juxt-web/views/context';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import { PortalPostListView } from '@/services/juxt-web/views/portal/postList';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import type { Request, Response } from 'express';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';
import type { UserPageViewProps } from '@/services/juxt-web/views/web/userPageView';
import type { HydratedSettingsDocument } from '@/models/settings';
export const userPageRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

const pidParamSchema = z.union([z.literal('me'), z.coerce.number()]);

userPageRouter.get('/menu', async function (req, res) {
	const { auth } = parseReq(req);
	const user = await database.getUserSettings(auth().pid);
	res.render('ctr/user_menu.ejs', {
		user: user
	});
});

userPageRouter.get('/me', async function (req, res) {
	const { auth, hasAuth } = parseReq(req);
	if (!hasAuth()) {
		return res.redirect('/404');
	}

	await userPage(req, res, auth().pid);
});

userPageRouter.get('/notifications.json', async function (req, res) {
	const { auth } = parseReq(req);
	const notifications = await database.getUnreadNotificationCount(auth().pid);
	const messagesCount = await database.getUnreadConversationCount(auth().pid);
	res.send(
		{
			message_count: messagesCount,
			notification_count: notifications
		}
	);
});

userPageRouter.get('/downloadUserData.json', async function (req, res) {
	const { auth } = parseReq(req);
	const rawPosts = await POST.find({ pid: auth().pid });
	const userSettings = await database.getUserSettings(auth().pid);
	const userContent = await database.getUserContent(auth().pid);

	if (!userContent || !userSettings) {
		return res.redirect('/404');
	}

	// Clean non-user data
	userSettings.banned_by = null;
	const postsJson = rawPosts.map(post => ({
		...post.toJSON(),
		removed_by: null
	}));

	const doc = {
		user_content: userContent,
		user_settings: userSettings,
		posts: postsJson
	};
	res.set('Content-Type', 'text/json');
	res.set('Content-Disposition', `attachment; filename="${auth().pid}_user_data.json"`);
	res.send(doc);
});

userPageRouter.get('/me/settings', async function (req, res) {
	const { auth } = parseReq(req);
	const userSettings = await database.getUserSettings(auth().pid);
	const communityMap = getCommunityHash();
	res.render(req.directory + '/settings.ejs', {
		communityMap: communityMap,
		moment: moment,
		userSettings: userSettings
	});
});

userPageRouter.get('/me/:type', async function (req, res) {
	const { auth, hasAuth } = parseReq(req);
	if (!hasAuth()) {
		return res.redirect('/404');
	}

	await userRelations(req, res, auth().pid);
});

userPageRouter.post('/me/settings', upload.none(), async function (req, res) {
	const { body, auth } = parseReq(req, {
		body: z.object({
			country: z.coerce.boolean(),
			birthday: z.coerce.boolean(),
			experience: z.coerce.boolean(),
			comment: z.string().optional()
		})
	});
	const userSettings = await database.getUserSettings(auth().pid);
	if (!userSettings) {
		return res.redirect('/users/me');
	}

	userSettings.country_visibility = body.country;
	userSettings.birthday_visibility = body.birthday;
	userSettings.game_skill_visibility = body.experience;
	userSettings.profile_comment_visibility = !!body.comment;
	userSettings.updateComment(body.comment ?? '');

	res.redirect('/users/me');
});

userPageRouter.get('/show', async function (req, res) {
	const { query } = parseReq(req, {
		query: z.object({
			pid: z.string().optional()
		})
	});
	if (!query.pid) {
		return res.redirect('/404');
	}

	res.redirect(`/users/${query.pid}`);
});

userPageRouter.get('/:pid/more', async function (req, res) {
	const { params } = parseReq(req, {
		params: z.object({
			pid: z.coerce.number()
		})
	});

	await morePosts(req, res, params.pid);
});

userPageRouter.get('/:pid/yeahs/more', async function (req, res) {
	const { params } = parseReq(req, {
		params: z.object({
			pid: z.coerce.number()
		})
	});

	await moreYeahPosts(req, res, params.pid);
});

userPageRouter.get('/:pid/:type', async function (req, res) {
	const { params } = parseReq(req, {
		params: z.object({
			pid: z.coerce.number()
		})
	});

	await userRelations(req, res, params.pid);
});

// TODO: Remove the need for a parameter to toggle the following state
userPageRouter.post('/follow', upload.none(), async function (req, res) {
	const { body, auth } = parseReq(req, {
		body: z.object({
			id: z.string()
		})
	});

	const userToFollow = await database.getUserContent(body.id);
	const userContent = await database.getUserContent(auth().pid);
	if (!userToFollow || !userContent || !userToFollow.pid) {
		// Invalid state, can't do a follow
		return res.send({ status: 423, id: body.id, count: userToFollow?.following_users.length ?? 0 });
	}

	const isFollowing = userContent.followed_users.includes(userToFollow.pid);
	let newFollowerCount = userToFollow.following_users.length;
	if (!isFollowing) {
		// Follow
		await (userToFollow as any).addToFollowers(userContent.pid);
		await (userContent as any).addToUsers(userToFollow.pid);
		newFollowerCount++;
		const existingNotification = await database.getNotification(userToFollow.pid, 2, userContent.pid);
		if (!existingNotification) {
			await newNotification({ pid: userToFollow.pid, type: 'follow', objectID: auth().pid.toString(), link: `/users/${auth().pid}` });
		}
	} else {
		// Unfollow
		await (userToFollow as any).removeFromFollowers(userContent.pid);
		await (userContent as any).removeFromUsers(userToFollow.pid);
		newFollowerCount--;
	}

	// idk why, but it always subtracts one from the count before returning
	res.send({ status: 200, id: userToFollow.pid, count: newFollowerCount - 1 });
});

userPageRouter.get('/:pid', async function (req, res) {
	const { params } = parseReq(req, {
		params: z.object({
			pid: pidParamSchema
		})
	});
	if (params.pid === 'me' || params.pid === req.pid) {
		return res.redirect('/users/me');
	}

	await userPage(req, res, params.pid);
});

userPageRouter.get('/:pid/:type', async function (req, res) {
	const { params } = parseReq(req, {
		params: z.object({
			pid: pidParamSchema
		})
	});
	if (params.pid === 'me' || params.pid === req.pid) {
		return res.redirect('/users/me');
	}

	await userRelations(req, res, params.pid);
});

async function userPage(req: Request, res: Response, userID: number): Promise<any> {
	const { query, auth, hasAuth } = parseReq(req, {
		query: z.object({
			pjax: z.string().optional()
		})
	});
	const isSelf = hasAuth() && userID === auth().pid;

	const pnid = isSelf
		? auth().user
		: await getUserAccountData(userID).catch((e) => {
				logger.error(e, `Could not fetch userdata for ${userID}`);
			});
	const userContent = await database.getUserContent(userID);
	const userSettings = await database.getUserSettings(userID);
	if (!pnid || !userContent || !userSettings) {
		return res.redirect('/404');
	}

	const posts = (await getPostsByPoster(req.tokens, userID, 0))?.items ?? [];

	const numPosts = await database.getTotalPostsByUserID(userID);
	const friends = await getUserFriendPIDs(userID);

	const parentUserContent = await database.getUserContent(req.pid);
	const link = isSelf ? '/users/me/' : `/users/${userID}/`;

	const postListProps: PostListViewProps = {
		ctx: buildContext(res),
		nextLink: `/users/${userID}/more?offset=${posts.length}&pjax=true`,
		posts,
		userContent: parentUserContent ?? userContent
	};
	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView {...postListProps} />,
			portal: <PortalPostListView {...postListProps} />,
			ctr: <CtrPostListView {...postListProps} />
		});
	}
	const props: UserPageViewProps = {
		ctx: buildContext(res),
		baseLink: link,
		friendPids: friends,
		isOnline: userSettings.last_active ? isDateInRange(userSettings.last_active, 10) : false,
		selectedTab: 0,
		totalPosts: numPosts,
		user: pnid,
		userContent: userContent,
		userSettings: userSettings,
		requestUserContent: parentUserContent
	};
	return res.jsxForDirectory({
		web: (
			<WebUserPageView {...props}>
				{/* TODO following_list.ejs */}
			</WebUserPageView>
		)
	});
}

async function userRelations(req: Request, res: Response, userID: number): Promise<any> {
	const { params, query, auth, hasAuth } = parseReq(req, {
		params: z.object({
			type: z.string()
		}),
		query: z.object({
			pjax: z.string().optional()
		})
	});
	const isSelf = hasAuth() && userID === auth().pid;

	const pnid = isSelf ? auth().user : await getUserAccountData(userID);
	const userContent = await database.getUserContent(userID);
	const link = isSelf ? '/users/me/' : `/users/${userID}/`;
	const userSettings = await database.getUserSettings(userID);
	const numPosts = await database.getTotalPostsByUserID(userID);
	const friends = await getUserFriendPIDs(userID);
	const parentUserContent = await database.getUserContent(req.pid);
	if (!pnid || !userSettings || !userContent) {
		return res.redirect('/404');
	}

	let followers: HydratedSettingsDocument[] = [];
	let communities: string[] = [];
	const communityMap = getCommunityHash();
	let selection = 0;

	if (params.type === 'yeahs') {
		const posts = (await getPostsByEmpathy(req.tokens, userID, 0))?.items ?? [];
		const postListProps: PostListViewProps = {
			ctx: buildContext(res),
			posts,
			nextLink: `/users/${userID}/yeahs/more?offset=${posts.length}&pjax=true`,
			userContent: parentUserContent ?? userContent
		};
		if (query.pjax) {
			return res.jsxForDirectory({
				web: <WebPostListView {...postListProps} />,
				portal: <PortalPostListView {...postListProps} />,
				ctr: <CtrPostListView {...postListProps} />
			});
		}

		const props: UserPageViewProps = {
			ctx: buildContext(res),
			baseLink: link,
			friendPids: friends,
			isOnline: userSettings.last_active ? isDateInRange(userSettings.last_active, 10) : false,
			selectedTab: 4,
			totalPosts: numPosts,
			user: pnid,
			userContent: userContent,
			userSettings: userSettings,
			requestUserContent: parentUserContent
		};
		return res.jsxForDirectory({
			web: (
				<WebUserPageView {...props}>
					<WebPostListView {...postListProps} />
				</WebUserPageView>
			)
		});
	}

	if (params.type === 'friends') {
		followers = await SETTINGS.find({ pid: friends });
		selection = 1;
	} else if (params.type === 'followers') {
		followers = await database.getFollowingUsers(userContent);
		selection = 3;
	} else {
		followers = await database.getFollowedUsers(userContent);
		communities = userContent?.followed_communities ?? [];
		selection = 2;
	}

	const bundle = {
		followers: followers ? followers : [],
		communities: communities,
		communityMap: communityMap
	};

	const postListProps: PostListViewProps = {
		ctx: buildContext(res),
		nextLink: '#',
		posts: [],
		userContent: parentUserContent ?? userContent
	};
	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView {...postListProps} /> // TODO following_list.ejs
		});
	}
	const props: UserPageViewProps = {
		ctx: buildContext(res),
		baseLink: link,
		friendPids: friends,
		isOnline: userSettings.last_active ? isDateInRange(userSettings.last_active, 10) : false,
		selectedTab: selection,
		totalPosts: numPosts,
		user: pnid,
		userContent: userContent,
		userSettings: userSettings,
		requestUserContent: parentUserContent
	};
	return res.jsxForDirectory({
		web: (
			<WebUserPageView {...props}>
				{/* TODO following_list.ejs */}
			</WebUserPageView>
		)
	});
}

async function morePosts(req: Request, res: Response, userID: number): Promise<any> {
	const { query } = parseReq(req, {
		query: z.object({
			offset: z.coerce.number().nonnegative().default(0)
		})
	});
	const { offset } = query;

	const userContent = await database.getUserContent(req.pid);
	const posts = (await getPostsByPoster(req.tokens, userID, offset))?.items ?? [];

	if (posts.length === 0 || !userContent) {
		return res.sendStatus(204);
	}

	const props: PostListViewProps = {
		ctx: buildContext(res),
		posts,
		nextLink: `/users/${userID}/more?offset=${offset + posts.length}&pjax=true`,
		userContent: userContent
	};
	return res.jsxForDirectory({
		web: <WebPostListView {...props} />,
		portal: <PortalPostListView {...props} />,
		ctr: <CtrPostListView {...props} />
	});
}

async function moreYeahPosts(req: Request, res: Response, userID: number): Promise<any> {
	const { query } = parseReq(req, {
		query: z.object({
			offset: z.coerce.number().nonnegative().default(0)
		})
	});
	const { offset } = query;

	const userContent = await database.getUserContent(userID);
	const posts = (await getPostsByEmpathy(req.tokens, userID, offset))?.items ?? [];

	if (posts.length === 0 || !userContent) {
		return res.sendStatus(204);
	}

	const props: PostListViewProps = {
		ctx: buildContext(res),
		posts,
		nextLink: `/users/${userID}/yeahs/more?offset=${offset + posts.length}&pjax=true`,
		userContent: userContent
	};
	return res.jsxForDirectory({
		web: <WebPostListView {...props} />,
		portal: <PortalPostListView {...props} />,
		ctr: <CtrPostListView {...props} />
	});
}

function isDateInRange(date: Date | null | undefined, minutes: number): boolean {
	if (!date) {
		return false;
	}
	const now = new Date();
	const tenMinutesAgo = new Date(now.getTime() - minutes * 60 * 1000);
	return date >= tenMinutesAgo && date <= now;
}
