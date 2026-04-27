import express from 'express';
import { z } from 'zod';
import { database } from '@/database';
import { createUser, setName } from '@/util';
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
		res.redirect(`/topics?topic_tag=${query.topic_tag}`);
	} else if (query.pid) {
		res.redirect(`/users/${query.pid}`);
	} else {
		res.redirect('/titles');
	}

	if (self) {
		setName(self.pid, self.miiName);
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

	if (!self || !req.new_users || req.directory === 'web') {
		return res.sendStatus(401);
	}

	if (self.hasDoneOnboarding) {
		return res.sendStatus(504); // Onboarding already finished
	}

	await createUser(auth().pid, body.experience, body.notifications);
	if (await database.getUserSettings(auth().pid) !== null) {
		res.sendStatus(200);
	} else {
		res.sendStatus(504);
	}
});
