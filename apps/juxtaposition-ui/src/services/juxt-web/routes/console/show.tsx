import express from 'express';
import { z } from 'zod';
import { database } from '@/database';
import { createUser, setName } from '@/util';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { buildContext } from '@/services/juxt-web/views/context';
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

	if (req.pid === 1000000000) {
		return res.render(req.directory + '/guest_notice.ejs');
	}

	const user = await database.getUserSettings(req.pid);
	const content = await database.getUserContent(req.pid);
	if (!user || !content) {
		return res.jsxForDirectory({
			web: <WebFirstRunView ctx={buildContext(res)} />,
			portal: <PortalFirstRunView ctx={buildContext(res)} />,
			ctr: <CtrFirstRunView ctx={buildContext(res)} />
		});
	}

	if (query.topic_tag) {
		res.redirect(`/topics?topic_tag=${query.topic_tag}`);
	} else if (query.pid) {
		res.redirect(`/users/${query.pid}`);
	} else {
		res.redirect('/titles');
	}

	if (hasAuth()) {
		const currentMii = auth().user.mii;
		const usrMii = await database.getUserSettings(req.pid);
		if (!currentMii || !usrMii) {
			return;
		}
		if (currentMii.name !== usrMii.screen_name) {
			setName(auth().pid, currentMii.name);
			usrMii.screen_name = currentMii.name;
			await usrMii.save();
		}
	}
});

showRouter.get('/first', async function (req, res) {
	return res.jsxForDirectory({
		web: <WebFirstRunView ctx={buildContext(res)} />,
		portal: <PortalFirstRunView ctx={buildContext(res)} />,
		ctr: <CtrFirstRunView ctx={buildContext(res)} />
	});
});

showRouter.post('/newUser', async function (req, res) {
	const { auth, body } = parseReq(req, {
		body: z.object({
			experience: z.number(),
			notifications: z.boolean()
		})
	});

	if (req.pid === null || !req.new_users || req.directory === 'web') {
		return res.sendStatus(401);
	}

	const user = await database.getUserSettings(auth().pid);
	if (user) {
		return res.sendStatus(504); // User already exists
	}

	await createUser(auth().pid, body.experience, body.notifications);
	if (await database.getUserSettings(auth().pid) !== null) {
		res.sendStatus(200);
	} else {
		res.sendStatus(504);
	}
});
