const express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const moment = require('moment');
const { POST } = require('../../../../models/post');
const router = express.Router();

router.get('/', async function (req, res) {
    let userContent = await database.getUserContent(req.pid);
    let communityMap = await util.data.getCommunityHash();
    let tag = req.query.topic_tag;
    console.log(tag)
    if(!userContent || !tag)
        return res.redirect('/404');
    let posts = await POST.find({ topic_tag: req.query.topic_tag }).sort({ created_at: -1}).limit(parseInt(req.query.limit));

    let bundle = {
        posts,
        open: true,
        communityMap,
        userContent,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        link: `/topics/more?tag=${tag}&offset=${posts.length}&pjax=true`
    }

    if(req.query.pjax)
        return res.render(req.directory + '/partials/posts_list.ejs', {
            bundle,
            moment,
            lang: req.lang
        });

    res.render(req.directory + '/feed.ejs', {
        moment: moment,
        title: tag,
        userContent: userContent,
        posts: posts,
        communityMap: communityMap,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid,
        bundle,
        template: 'posts_list',
        moderator: req.moderator
    });
});

router.get('/more', async function (req, res) {
    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let userContent = await database.getUserContent(req.pid);
    let communityMap = await util.data.getCommunityHash();
    let tag = req.query.topic_tag;
    if(!tag) return res.sendStatus(204);
    let posts = await POST.find({ topic_tag: req.query.topic_tag }).sort({ created_at: -1}).limit(parseInt(req.query.limit));

    let bundle = {
        posts,
        numPosts: posts.length,
        open: true,
        communityMap,
        userContent,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        link: `/topics/more?tag=${tag}&offset=${posts.length}&pjax=true`
    }

    if(posts.length > 0) {
        res.render(req.directory + '/partials/posts_list.ejs', {
            communityMap: communityMap,
            moment: moment,
            database: database,
            bundle,
            account_server: config.account_server_domain.slice(8),
            cdnURL: config.CDN_domain,
            lang: req.lang,
            mii_image_CDN: config.mii_image_CDN,
            pid: req.pid,
            moderator: req.moderator
        });
    }
    else
        res.sendStatus(204);
});

module.exports = router;
