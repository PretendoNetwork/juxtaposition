import express from 'express';
import { rateLimit } from 'express-rate-limit';
import postsHandlers from '@/services/api/routes/posts';
import friendMessagesHandlers from '@/services/api/routes/friend_messages';
import communitiesHandlers from '@/services/api/routes/communities';
import peopleHandlers from '@/services/api/routes/people';
import topicsHandlers from '@/services/api/routes/topics';
import usersHandlers from '@/services/api/routes/users';
import statusHandlers from '@/services/api/routes/status';
import { restrictHostnames } from '@/middleware/hostLimit';
import { config } from '@/config';

// Main router for endpointsindex.js
const router = express.Router();

// Router to handle the subdomain restriction
const api = express.Router();

// Global API ratelimit (todo: make this more fine-grained for heavy queries)
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 400, // 26 per minute
	standardHeaders: true,
	legacyHeaders: true
});
router.use(limiter);

router.use(restrictHostnames([config.domains.api], api));

// Setup routes
api.use('/v1/posts', postsHandlers);
api.use('/v1/posts.search', postsHandlers);
api.use('/v1/friend_messages', friendMessagesHandlers);
api.use('/v1/communities/', communitiesHandlers);
api.use('/v1/people/', peopleHandlers);
api.use('/v1/topics/', topicsHandlers);
api.use('/v1/users/', usersHandlers);
api.use('/v1/status/', statusHandlers);

export default router;
