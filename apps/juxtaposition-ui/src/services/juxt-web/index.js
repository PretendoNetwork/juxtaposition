const express = require('express');
const subdomain = require('express-subdomain');
const logger = require('../../logger');
const webAuth = require('../../middleware/webAuth');
const consoleAuth = require('../../middleware/consoleAuth');
const checkBan = require('../../middleware/checkBan');
const detectVersion = require('../../middleware/detectVersion');
const checkDiscovery = require('../../middleware/discovery');
const routes = require('./routes');

const router = express.Router();
const consoleRouter = express.Router();
const webRouter = express.Router();

// We want to check which domain we're running on before we fetch any files,
// but we don't care about discovery until we're making it to the consoles themselves
router.use(detectVersion);
router.use('/', routes.WEB_FILES);
router.use('/robots.txt', routes.ROBOTS);
router.use('/web', routes.PWA);
router.use(checkDiscovery);

// Create subdomains
logger.info('[JUXT-WEB] Creating \'Web\' subdomain');
router.use(subdomain('juxt', webRouter));
router.use(subdomain('juxt-beta', webRouter));
router.use(subdomain('juxt-dev', webRouter));

logger.info('[JUXT-WEB] Creating \'Wii U\' subdomain');
router.use(subdomain('portal.olv', consoleRouter));
router.use(subdomain('portal-beta.olv', consoleRouter));
router.use(subdomain('portal-dev.olv', consoleRouter));

logger.info('[JUXT-WEB] Creating \'3DS\' subdomain');
router.use(subdomain('ctr.olv', consoleRouter));
router.use(subdomain('ctr-beta.olv', consoleRouter));
router.use(subdomain('ctr-dev.olv', consoleRouter));

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

module.exports = router;
