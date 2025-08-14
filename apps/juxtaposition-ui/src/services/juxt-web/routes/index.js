import { communitiesRouter } from './console/communities';
import { showRouter } from './console/show';
import { postsRouter } from './console/posts';
import { userPageRouter } from './console/userpage';
import { feedRouter } from './console/feed';
import { notificationRouter } from './console/notifications';
import { messagesRouter } from './console/messages';
import { topicsRouter } from './console/topics';
import { loginRouter } from './web/login';
import { robotsRouter } from './web/robots';
import { pwaRouter } from './web/pwa';
import { adminRouter } from './admin/admin';
import { webRouter } from './console/web';

export const routes = {
	PORTAL_SHOW: showRouter,
	PORTAL_COMMUNITIES: communitiesRouter,
	PORTAL_USER: userPageRouter,
	PORTAL_POST: postsRouter,
	PORTAL_FEED: feedRouter,
	PORTAL_NEWS: notificationRouter,
	PORTAL_MESSAGES: messagesRouter,
	PORTAL_TOPICS: topicsRouter,
	WEB_LOGIN: loginRouter,
	ROBOTS: robotsRouter,
	PWA: pwaRouter,
	ADMIN: adminRouter,
	WEB_FILES: webRouter
};
