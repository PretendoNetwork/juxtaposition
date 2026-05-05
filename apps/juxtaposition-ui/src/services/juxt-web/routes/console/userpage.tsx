import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { database } from '@/database';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebUserMissingPage, WebUserPageView } from '@/services/juxt-web/views/web/userPageView';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import { PortalPostListView } from '@/services/juxt-web/views/portal/postList';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import { WebUserPageFollowingView } from '@/services/juxt-web/views/web/userPageFollowingView';
import { PortalUserPageFollowingView } from '@/services/juxt-web/views/portal/userPageFollowingView';
import { CtrUserPageFollowingView } from '@/services/juxt-web/views/ctr/userPageFollowingView';
import { CtrUserMenuView } from '@/services/juxt-web/views/ctr/userMenu';
import { PortalUserSettingsView } from '@/services/juxt-web/views/portal/userSettingsView';
import { CtrUserSettingsView } from '@/services/juxt-web/views/ctr/userSettingsView';
import { PortalUserMissingPage, PortalUserPageView } from '@/services/juxt-web/views/portal/userPageView';
import { CtrUserMissingPage, CtrUserPageView } from '@/services/juxt-web/views/ctr/userPageView';
import { wrapApi } from '@/api/errors';
import type { Request, Response } from 'express';
import type { CommunityViewData, UserPageFollowingViewProps } from '@/services/juxt-web/views/web/userPageFollowingView';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';
import type { UserMissingPageViewProps, UserPageViewProps } from '@/services/juxt-web/views/web/userPageView';
import type { UserSettingsViewProps } from '@/services/juxt-web/views/web/userSettingsView';
import type { ShallowUser } from '@/api/generated';
export const userPageRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

const pidParamSchema = z.union([z.literal('me'), z.coerce.number()]);

userPageRouter.get('/menu', async function (req, res) {
	res.jsx(<CtrUserMenuView />);
});

userPageRouter.get('/me', async function (req, res) {
	const { auth, hasAuth } = parseReq(req);
	if (!hasAuth()) {
		return res.redirect('/404');
	}

	await userPage(req, res, auth().pid);
});

userPageRouter.get('/notifications.json', async function (req, res) {
	const { data: notificationCounts } = await req.api.self.getNotifications();
	res.send(
		{
			notification_count: notificationCounts.unreadNotifications
		}
	);
});

userPageRouter.get('/downloadUserData.json', async function (req, res) {
	const { auth } = parseReq(req);
	const { data } = await req.api.self.export();

	res.set('Content-Type', 'text/json');
	res.set('Content-Disposition', `attachment; filename="${auth().pid}_user_data.json"`);
	res.send(JSON.stringify(data, null, 2));
});

userPageRouter.get('/me/settings', async function (req, res) {
	const { auth } = parseReq(req);
	const userSettings = await database.getUserSettings(auth().pid);
	if (!userSettings) {
		return res.redirect('/404');
	}

	const props: UserSettingsViewProps = {
		userSettings
	};
	res.jsxForDirectory({
		portal: <PortalUserSettingsView {...props} />,
		ctr: <CtrUserSettingsView {...props} />
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
			id: z.coerce.number()
		})
	});

	const { data: userToFollowProfile } = await req.api.users.getProfile({ id: body.id });
	const userContent = auth().self.content;
	if (!userToFollowProfile) {
		// Invalid state, can't do a follow
		return res.send({ status: 423, id: body.id, count: 0 });
	}

	const isFollowing = userContent.followed_users.includes(userToFollowProfile.pid);
	const shouldFollow = !isFollowing;
	if (shouldFollow) {
		await req.api.users.followerUser({ id: userToFollowProfile.pid });
	} else {
		await req.api.users.unfollowUser({ id: userToFollowProfile.pid });
	}

	const changeNum = shouldFollow ? 1 : -1;
	const newFollowerCount = userToFollowProfile.followers + changeNum;

	// idk why, but it always subtracts one from the count before returning
	res.send({ status: 200, id: userToFollowProfile.pid, count: newFollowerCount - 1 });
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
	const self = hasAuth() ? auth().self : null;
	const isSelf = hasAuth() && userID === auth().pid;

	const { result: profile, error } = await wrapApi(req.api.users.getProfile({ id: userID }));
	const missingPageProps: UserMissingPageViewProps = {
		pid: userID,
		isBanned: error?.isCode('user_banned') ?? false,
		isDeleted: error?.isCode('user_deleted') ?? false
	};
	if (missingPageProps.isBanned || missingPageProps.isDeleted) {
		return res.jsxForDirectory({
			web: <WebUserMissingPage {...missingPageProps} />,
			portal: <PortalUserMissingPage {...missingPageProps} />,
			ctr: <CtrUserMissingPage {...missingPageProps} />
		});
	}
	if (error) {
		throw error;
	}
	if (!profile) {
		return res.jsxForDirectory({
			web: <WebUserMissingPage {...missingPageProps} />,
			portal: <PortalUserMissingPage {...missingPageProps} />,
			ctr: <CtrUserMissingPage {...missingPageProps} />
		});
	}

	const { data: postPage } = await req.api.users.posts.list({ id: userID });
	const link = isSelf ? '/users/me/' : `/users/${userID}/`;

	const postListProps: PostListViewProps = {
		nextLink: `/users/${userID}/more?offset=${postPage.items.length}&pjax=true`,
		posts: postPage.items,
		userContent: self?.content ?? null
	};
	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView {...postListProps} />,
			portal: <PortalPostListView {...postListProps} />,
			ctr: <CtrPostListView {...postListProps} />
		});
	}
	const props: UserPageViewProps = {
		baseLink: link,
		selectedTab: 0,
		profile,
		requestUserContent: self?.content ?? null
	};
	return res.jsxForDirectory({
		web: (
			<WebUserPageView {...props}>
				<WebPostListView {...postListProps} />
			</WebUserPageView>
		),
		portal: (
			<PortalUserPageView {...props}>
				<PortalPostListView {...postListProps} />
			</PortalUserPageView>
		),
		ctr: (
			<CtrUserPageView {...props}>
				<CtrPostListView {...postListProps} />
			</CtrUserPageView>
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
	const self = hasAuth() ? auth().self : null;
	const isSelf = hasAuth() && userID === auth().pid;

	const { result: profile, error } = await wrapApi(req.api.users.getProfile({ id: userID }));
	const missingPageProps: UserMissingPageViewProps = {
		pid: userID,
		isBanned: error?.isCode('user_banned') ?? false,
		isDeleted: error?.isCode('user_deleted') ?? false
	};
	if (missingPageProps.isBanned || missingPageProps.isDeleted) {
		return res.jsxForDirectory({
			web: <WebUserMissingPage {...missingPageProps} />,
			portal: <PortalUserMissingPage {...missingPageProps} />,
			ctr: <CtrUserMissingPage {...missingPageProps} />
		});
	}
	if (error) {
		throw error;
	}
	if (!profile) {
		return res.jsxForDirectory({
			web: <WebUserMissingPage {...missingPageProps} />,
			portal: <PortalUserMissingPage {...missingPageProps} />,
			ctr: <CtrUserMissingPage {...missingPageProps} />
		});
	}

	const link = isSelf ? '/users/me/' : `/users/${userID}/`;

	let followers: ShallowUser[] = [];
	let communities: CommunityViewData[] = [];
	let selection = 0;

	if (params.type === 'yeahs') {
		const posts = (await req.api.posts.list({ empathy_by: userID }))?.data.items ?? [];
		const postListProps: PostListViewProps = {
			posts,
			nextLink: `/users/${userID}/yeahs/more?offset=${posts.length}&pjax=true`,
			userContent: self?.content ?? null
		};
		if (query.pjax) {
			return res.jsxForDirectory({
				web: <WebPostListView {...postListProps} />,
				portal: <PortalPostListView {...postListProps} />,
				ctr: <CtrPostListView {...postListProps} />
			});
		}

		const props: UserPageViewProps = {
			baseLink: link,
			selectedTab: 4,
			profile,
			requestUserContent: self?.content ?? null
		};
		return res.jsxForDirectory({
			web: (
				<WebUserPageView {...props}>
					<WebPostListView {...postListProps} />
				</WebUserPageView>
			),
			portal: (
				<PortalUserPageView {...props}>
					<PortalPostListView {...postListProps} />
				</PortalUserPageView>
			),
			ctr: (
				<CtrUserPageView {...props}>
					<CtrPostListView {...postListProps} />
				</CtrUserPageView>
			)
		});
	}

	if (params.type === 'friends') {
		const { data: page } = await req.api.users.listFriends({ id: userID, limit: 100 });
		followers = page.items;
		selection = 1;
	} else if (params.type === 'followers') {
		const { data: page } = await req.api.users.listFollowers({ id: userID, limit: 100 });
		followers = page.items;
		selection = 3;
	} else {
		const { data: page } = await req.api.users.listFollowing({ id: userID, limit: 100 });
		const { data: communityPage } = await req.api.users.listFollowedCommunities({ id: userID, limit: 100 });
		followers = page.items;
		communities = communityPage.items.map(com => ({ id: com.olive_community_id, name: com.name }));
		selection = 2;
	}

	const listProps: UserPageFollowingViewProps = {
		followers,
		communities
	};
	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebUserPageFollowingView {...listProps} />,
			portal: <PortalUserPageFollowingView {...listProps} />,
			ctr: <CtrUserPageFollowingView {...listProps} />
		});
	}
	const props: UserPageViewProps = {
		baseLink: link,
		selectedTab: selection,
		profile,
		requestUserContent: self?.content ?? null
	};
	return res.jsxForDirectory({
		web: (
			<WebUserPageView {...props}>
				<WebUserPageFollowingView {...listProps} />
			</WebUserPageView>
		),
		portal: (
			<PortalUserPageView {...props}>
				<PortalUserPageFollowingView {...listProps} />
			</PortalUserPageView>
		),
		ctr: (
			<CtrUserPageView {...props}>
				<CtrUserPageFollowingView {...listProps} />
			</CtrUserPageView>
		)
	});
}

async function morePosts(req: Request, res: Response, userID: number): Promise<any> {
	const { query, auth, hasAuth } = parseReq(req, {
		query: z.object({
			offset: z.coerce.number().nonnegative().default(0)
		})
	});
	const { offset } = query;

	const userContent = hasAuth() ? auth().self.content : null;
	const posts = (await req.api.users.posts.list({ id: userID, offset }))?.data.items ?? [];

	if (posts.length === 0 || !userContent) {
		return res.sendStatus(204);
	}

	const props: PostListViewProps = {
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
	const { query, hasAuth, auth } = parseReq(req, {
		query: z.object({
			offset: z.coerce.number().nonnegative().default(0)
		})
	});
	const { offset } = query;

	const userContent = hasAuth() ? auth().self.content : null;
	const posts = (await req.api.posts.list({ empathy_by: userID, offset }))?.data.items ?? [];

	if (posts.length === 0) {
		return res.sendStatus(204);
	}

	const props: PostListViewProps = {
		posts,
		nextLink: `/users/${userID}/yeahs/more?offset=${offset + posts.length}&pjax=true`,
		userContent
	};
	return res.jsxForDirectory({
		web: <WebPostListView {...props} />,
		portal: <PortalPostListView {...props} />,
		ctr: <CtrPostListView {...props} />
	});
}
