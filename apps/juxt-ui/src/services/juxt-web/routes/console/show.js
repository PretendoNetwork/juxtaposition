const express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const router = express.Router();

router.get('/', async function (req, res) {
    if(req.pid === 1000000000) {
        return res.render(req.directory + '/guest_notice.ejs', {
            cdnURL: config.CDN_domain,
            lang: req.lang,
            moderator: req.moderator
        });
    }

    let user = await database.getUserSettings(req.pid);
    let content = await database.getUserContent(req.pid)
    if(!user || !content) {
        res.render(req.directory + '/first_run.ejs', {
            cdnURL: config.CDN_domain,
            lang: req.lang,
            pid: req.pid,
            moderator: req.moderator
        });
    }

    if(req.query.topic_tag) {
        res.redirect(`/topics?topic_tag=${req.query.topic_tag}`)
    }
    else if(req.query.pid) {
        res.redirect(`/users/${req.query.pid}`)
    }
    else
        res.redirect('/titles')

    let usrMii = await database.getUserSettings(req.pid);
    if(req.user.mii.name !== usrMii.screen_name) {
        util.data.setName(req.pid, req.user.mii.name);
        usrMii.screen_name = req.user.mii.name;
        await usrMii.save();
    }
});

router.get('/first', async function (req, res) {
    res.render(req.directory + '/first_run.ejs', {
        cdnURL: config.CDN_domain,
        lang: req.lang,
        moderator: req.moderator
    });
});

router.post('/newUser', async function (req, res) {
    if(req.pid === null)
        return res.sendStatus(401);

    let user = await database.getUserSettings(req.pid);
    if(user)
        return res.sendStatus(504);

    await util.data.create_user(req.pid, req.body.experience, req.body.notifications);
    if(await database.getUserSettings(req.pid) !== null)
        res.sendStatus(200);
    else
        res.sendStatus(504);

});

module.exports = router;
