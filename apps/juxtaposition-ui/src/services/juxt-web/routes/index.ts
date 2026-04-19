import { communitiesRouter } from '@/services/juxt-web/routes/console/communities';
import { showRouter } from '@/services/juxt-web/routes/console/show';
import { postsRouter } from '@/services/juxt-web/routes/console/posts';
import { userPageRouter } from '@/services/juxt-web/routes/console/userpage';
import { feedRouter } from '@/services/juxt-web/routes/console/feed';
import { notificationRouter } from '@/services/juxt-web/routes/console/notifications';
import { topicsRouter } from '@/services/juxt-web/routes/console/topics';
import { loginRouter } from '@/services/juxt-web/routes/web/login';
import { adminRouter } from '@/services/juxt-web/routes/admin/admin';
import { staticRouter } from '@/services/juxt-web/routes/console/static';
import { entrypointRouter } from '@/services/juxt-web/routes/console/entrypoint';

export const routes = {
	PORTAL_SHOW: showRouter,
	PORTAL_COMMUNITIES: communitiesRouter,
	PORTAL_USER: userPageRouter,
	PORTAL_POST: postsRouter,
	PORTAL_FEED: feedRouter,
	PORTAL_NEWS: notificationRouter,
	PORTAL_TOPICS: topicsRouter,
	WEB_LOGIN: loginRouter,
	ADMIN: adminRouter,
	STATIC: staticRouter,
	ENTRYPOINT: entrypointRouter
};
