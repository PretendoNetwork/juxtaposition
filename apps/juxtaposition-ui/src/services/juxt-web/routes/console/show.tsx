import express from 'express';
import { z } from 'zod';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebFirstRunView } from '@/services/juxt-web/views/web/firstRunView';
import { PortalFirstRunView } from '@/services/juxt-web/views/portal/firstRunView';
import { CtrFirstRunView } from '@/services/juxt-web/views/ctr/firstRunView';

export const showRouter = express.Router();

showRouter.get('/', async function (req, res) {
	const { auth, hasAuth, query } = parseReq(req, {
		query: z.object({
			topic_tag: z.string().optional(),
			pid: z.string().optional()
		})
	});

	const self = hasAuth() ? auth().self : null;
	if (!self?.hasDoneOnboarding) {
		return res.jsxForDirectory({
			web: <WebFirstRunView />,
			portal: <PortalFirstRunView />,
			ctr: <CtrFirstRunView />
		});
	}

	if (query.topic_tag) {
		res.redirect(`/topics?${new URLSearchParams({ topic_tag: query.topic_tag })}`);
	} else if (query.pid) {
		res.redirect(`/users/${query.pid}`);
	} else {
		res.redirect('/titles');
	}
});

showRouter.get('/first', async function (req, res) {
	return res.jsxForDirectory({
		web: <WebFirstRunView />,
		portal: <PortalFirstRunView />,
		ctr: <CtrFirstRunView />
	});
});

showRouter.post('/newUser', async function (req, res) {
	const { auth, hasAuth, body } = parseReq(req, {
		body: z.object({
			experience: z.number(),
			notifications: z.boolean()
		})
	});
	const self = hasAuth() ? auth().self : null;

	const newUsersEnabled = !!req.new_users; // Can this instance onboard new users?
	const platformAllowsOnboarding = req.directory !== 'web'; // Web is not allowed to onboard users
	const isAuthed = !!self;

	const canDoOnboarding = isAuthed && platformAllowsOnboarding && newUsersEnabled;
	if (!canDoOnboarding) {
		return res.sendStatus(401);
	}

	if (self.hasDoneOnboarding) {
		return res.sendStatus(504); // Onboarding already finished
	}

	await req.api.onboarding.submit({
		experienceId: body.experience,
		receiveNotifications: body.notifications
	});
	res.sendStatus(200);
});
