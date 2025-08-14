import * as express from 'express';
import * as database from '@/database';
import * as util from '@/util';
export const showRouter = express.Router();

showRouter.get('/', async function (req, res) {
	if (req.pid === 1000000000) {
		return res.render(req.directory + '/guest_notice.ejs');
	}

	const user = await database.getUserSettings(req.pid);
	const content = await database.getUserContent(req.pid);
	if (!user || !content) {
		return res.render(req.directory + '/first_run.ejs');
	}

	if (req.query.topic_tag) {
		res.redirect(`/topics?topic_tag=${req.query.topic_tag}`);
	} else if (req.query.pid) {
		res.redirect(`/users/${req.query.pid}`);
	} else {
		res.redirect('/titles');
	}

	const usrMii = await database.getUserSettings(req.pid);
	if (req.user.mii.name !== usrMii.screen_name) {
		util.setName(req.pid, req.user.mii.name);
		usrMii.screen_name = req.user.mii.name;
		await usrMii.save();
	}
});

showRouter.get('/first', async function (req, res) {
	res.render(req.directory + '/first_run.ejs');
});

showRouter.post('/newUser', async function (req, res) {
	if (req.pid === null || !req.new_users || req.directory === 'web') {
		return res.sendStatus(401);
	}

	const user = await database.getUserSettings(req.pid);
	if (user) {
		return res.sendStatus(504);
	}

	await util.createUser(req.pid, req.body.experience, req.body.notifications);
	if (await database.getUserSettings(req.pid) !== null) {
		res.sendStatus(200);
	} else {
		res.sendStatus(504);
	}
});
