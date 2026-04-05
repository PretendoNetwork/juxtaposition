import express from 'express';
import { webAuth } from '@/middleware/webAuth';
import { consoleAuth } from '@/middleware/consoleAuth';
import { checkBan } from '@/middleware/checkBan';
import { detectVersion } from '@/middleware/detectVersion';
import { checkDiscovery } from '@/middleware/discovery';
import { routes } from '@/services/juxt-web/routes';
import { restrictHostnames } from '@/middleware/hostLimit';
import { config } from '@/config';

export const router = express.Router();
const consoleRouter = express.Router();
const webRouter = express.Router();

// We want to check which domain we're running on before we fetch any files,
// but we don't care about discovery until we're making it to the consoles themselves
router.use(detectVersion);
router.use(routes.STATIC);
router.use(routes.ENTRYPOINT);
router.use(checkDiscovery);

// Create subdomains
router.use(restrictHostnames([config.domains.web], webRouter));
router.use(restrictHostnames([config.domains.portal, config.domains.ctr], consoleRouter));

// Setup routes for console
consoleRouter.use(consoleAuth);
consoleRouter.use(checkBan);
consoleRouter.use('/titles/show', routes.PORTAL_SHOW);
consoleRouter.use('/titles', routes.PORTAL_COMMUNITIES);
consoleRouter.use('/communities', routes.PORTAL_COMMUNITIES);
consoleRouter.use('/topics', routes.PORTAL_TOPICS);
consoleRouter.use('/users', routes.PORTAL_USER);
consoleRouter.use('/posts', routes.PORTAL_POST);
consoleRouter.use('/feed', routes.PORTAL_FEED);
consoleRouter.use('/friend_messages', routes.PORTAL_MESSAGES);
consoleRouter.use('/news', routes.PORTAL_NEWS);

// Setup routes for web
webRouter.use(webAuth);
webRouter.use(checkBan);
webRouter.use('/titles/show', routes.PORTAL_SHOW);
webRouter.use('/titles', routes.PORTAL_COMMUNITIES);
webRouter.use('/communities', routes.PORTAL_COMMUNITIES);
webRouter.use('/topics', routes.PORTAL_TOPICS);
webRouter.use('/users', routes.PORTAL_USER);
webRouter.use('/posts', routes.PORTAL_POST);
webRouter.use('/feed', routes.PORTAL_FEED);
webRouter.use('/friend_messages', routes.PORTAL_MESSAGES);
webRouter.use('/news', routes.PORTAL_NEWS);
webRouter.use('/login', routes.WEB_LOGIN);
webRouter.use('/admin', routes.ADMIN);
