const express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const multer  = require('multer');
const moment = require('moment');
const upload = multer({ dest: 'uploads/' });
const { POST } = require('../../../../models/post');
const {SETTINGS} = require("../../../../models/settings");
const router = express.Router();

router.get('/menu', async function (req, res) {
    let user = await database.getUserSettings(req.pid);
    res.render('ctr/user_menu.ejs', {
        user: user,
    });
});

router.get('/me', async function (req, res) { await userPage(req, res, req.pid) });

router.get('/me/settings', async function (req, res) {
    let userSettings = await database.getUserSettings(req.pid);
    let communityMap = await util.data.getCommunityHash();
    res.render(req.directory + '/settings.ejs', {
        communityMap: communityMap,
        moment: moment,
        userSettings: userSettings,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid,
        moderator: req.moderator
    });
});

router.get('/me/:type', async function (req, res) { await userRelations(req, res, req.pid) });

router.post('/me/settings', upload.none(), async function (req, res) {
    let userSettings = await database.getUserSettings(req.pid);

    userSettings.country_visibility = !!req.body.country;
    userSettings.birthday_visibility = !!req.body.birthday;
    userSettings.game_skill_visibility = !!req.body.experience;
    userSettings.profile_comment_visibility = !!req.body.comment;

    if (req.body.comment)
        userSettings.updateComment(req.body.comment);
    else
        userSettings.updateComment('');

    res.redirect('/users/me');
});

router.get('/show', async function (req, res) {
   res.redirect(`/users/${req.query.pid}`);
});

router.get('/:pid/more', async function (req, res) { await morePosts(req, res, req.params.pid) });

router.get('/:pid/yeahs/more', async function (req, res) { await moreYeahPosts(req, res, req.params.pid) });

router.get('/:pid/:type', async function (req, res) { await userRelations(req, res, req.params.pid) });

// TODO: Remove the need for a parameter to toggle the following state
router.post('/follow', upload.none(), async function (req, res) {
    let userToFollowContent = await database.getUserContent(req.body.id);
    let userContent = await database.getUserContent(req.pid);
    if(userContent !== null && userContent.followed_users.indexOf(userToFollowContent.pid) === -1)
    {
        userToFollowContent.addToFollowers(userContent.pid);
        userContent.addToUsers(userToFollowContent.pid);
        res.send({ status: 200, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
        let picked = await database.getNotification(userToFollowContent.pid, 2, userContent.pid);
        //pid, type, reference_id, origin_pid, title, content
        if(picked === null)
            await util.data.newNotification({ pid: userToFollowContent.pid, type: "follow", objectID: req.pid, link: `/users/${req.pid}` });
    }
    else if(userContent !== null  && userContent.followed_users.indexOf(userToFollowContent.pid) !== -1)
    {
        userToFollowContent.removeFromFollowers(userContent.pid);
        userContent.removeFromUsers(userToFollowContent.pid);
        res.send({ status: 200, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
    }
    else
        res.send({ status: 423, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
});

router.get('/:pid', async function (req, res) {
    const userID = req.params.pid;
    if(userID === 'me' || Number(userID) === req.pid)
        return res.redirect('/users/me');
    await userPage(req, res, userID);
});

router.get('/:pid/:type', async function (req, res) {
    const userID = req.params.pid;
    if(userID === 'me' || Number(userID) === req.pid)
        return res.redirect('/users/me');
    await userRelations(req, res, userID);
});

async function userPage(req, res, userID) {
    let pnid = userID === req.pid ? req.user : await util.data.getUserDataFromPid(userID).catch((e) => {
        console.log(e.details);
    });
    let userContent = await database.getUserContent(userID);
    if(isNaN(userID) || !pnid || !userContent)
        return res.redirect('/404');
    let userSettings = await database.getUserSettings(userID);
    let posts = await database.getNumberUserPostsByID(userID, config.post_limit);
    let numPosts = await database.getTotalPostsByUserID(userID);
    let communityMap = await util.data.getCommunityHash();
    let friends = await util.data.getFriends(userID);
    let parentUserContent;
    if(pnid.pid !== req.pid)
        parentUserContent = await database.getUserContent(req.pid);

    let bundle = {
        posts,
        open: true,
        numPosts,
        communityMap,
        userContent: parentUserContent ? parentUserContent : userContent,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        link: `/users/${userID}/more?offset=${posts.length}&pjax=true`
    }

    if(req.query.pjax)
        return res.render(req.directory + '/partials/posts_list.ejs', {
            bundle,
            lang: req.lang,
            moment
        });
    let link = (pnid.pid === req.pid) ? '/users/me/' : `/users/${userID}/`;
    res.render(req.directory + '/user_page.ejs', {
        template: 'posts_list',
        selection: 0,
        moment,
        pnid,
        numPosts,
        userContent,
        userSettings,
        bundle,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid,
        link,
        friends,
        parentUserContent,
        moderator: req.moderator
    });
}

async function userRelations(req, res, userID) {
    let pnid = userID === req.pid ? req.user : await util.data.getUserDataFromPid(userID);
    let userContent = await database.getUserContent(userID);
    let link = (pnid.pid === req.pid) ? '/users/me/' : `/users/${userID}/`;
    let userSettings = await database.getUserSettings(userID);
    let numPosts = await database.getTotalPostsByUserID(userID);
    let friends = await util.data.getFriends(userID);
    let parentUserContent;
    if(pnid.pid !== req.pid)
        parentUserContent = await database.getUserContent(req.pid);
    if(isNaN(userID) || !pnid)
        return res.redirect('/404');

    let followers, communities, communityMap, selection;

    if(req.params.type === 'yeahs') {
        let posts = await POST.find({ yeahs: req.pid, removed: false }).sort({created_at: -1});
        /*let posts = await POST.aggregate([
            { $match: { id: { $in: likesArray } } },
            {$addFields: {
                    "__order": { $indexOfArray: [ likesArray, "$id" ] }
                }},
            { $sort: { "__order": 1 } },
            { $project: { index: 0, _id: 0 } },
            { $limit: config.post_limit }
        ]);*/
        let communityMap = await util.data.getCommunityHash();
        let bundle = {
            posts,
            open: true,
            numPosts: posts.length,
            communityMap,
            userContent: parentUserContent ? parentUserContent : userContent,
            lang: req.lang,
            mii_image_CDN: config.mii_image_CDN,
            link: `/users/${userID}/yeahs/more?offset=${posts.length}&pjax=true`
        }

        if(req.query.pjax)
            return res.render(req.directory + '/partials/posts_list.ejs', {
                bundle,
                lang: req.lang,
                moment
            });
        else
            return res.render(req.directory + '/user_page.ejs', {
                template: 'posts_list',
                selection: 4,
                moment,
                pnid,
                numPosts,
                userContent,
                userSettings,
                bundle,
                account_server: config.account_server_domain.slice(8),
                cdnURL: config.CDN_domain,
                lang: req.lang,
                mii_image_CDN: config.mii_image_CDN,
                pid: req.pid,
                link,
                friends,
                parentUserContent,
                moderator: req.moderator
            });
    }

    if(req.params.type === 'friends') {
        followers = await SETTINGS.find({ pid: friends });
        communities = [];
        selection = 2;
    }
    else if(req.params.type === 'followers') {
        followers = await database.getFollowingUsers(userContent);
        communities = [];
        selection = 3;
    }
    else {
        followers = await database.getFollowedUsers(userContent);
        communities = userContent.followed_communities;
        communityMap = await util.data.getCommunityHash();
        selection = 2;
    }

    if(followers[0] === '0')
        followers.splice(0, 0);
    if(communities[0] === '0')
        communities.splice(0, 1);

    let bundle = {
        followers: followers ? followers : [],
        communities: communities,
        communityMap: communityMap
    }

    if(req.query.pjax)
        return res.render(req.directory + '/partials/following_list.ejs', {
            bundle,
        });
    res.render(req.directory + '/user_page.ejs', {
        template: 'following_list',
        selection: selection,
        moment,
        pnid,
        numPosts,
        userContent,
        userSettings,
        bundle,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid,
        link,
        parentUserContent,
        moderator: req.moderator
    });
}

async function morePosts(req, res, userID) {
    let offset = parseInt(req.query.offset);
    let userContent = await database.getUserContent(req.pid);
    let communityMap = await util.data.getCommunityHash();
    if(!offset) offset = 0;
    let posts = await database.getUserPostsOffset(userID, config.post_limit, offset);

    let bundle = {
        posts,
        numPosts: posts.length,
        open: true,
        communityMap,
        userContent,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        link: `/users/${userID}/more?offset=${offset + posts.length}&pjax=true`
    }

    if(posts.length > 0)
    {
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
}

async function moreYeahPosts(req, res, userID) {
    let offset = parseInt(req.query.offset);
    let parentUserContent = await database.getUserContent(userID);
    let userContent = await database.getUserContent(req.pid);
    let communityMap = await util.data.getCommunityHash();
    if(!offset) offset = 0;
    let likesArray = await userContent.likes.slice().reverse();
    let posts = await POST.aggregate([
        { $match: { id: { $in: likesArray }, removed: false } },
        {$addFields: {
                "__order": { $indexOfArray: [ likesArray, "$id" ] }
            }},
        { $sort: { "__order": 1 } },
        { $project: { index: 0, _id: 0 } },
        { $skip : offset },
        { $limit: config.post_limit }
    ]);

    let bundle = {
        posts: posts.reverse(),
        numPosts: posts.length,
        open: true,
        communityMap,
        userContent,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        link: `/users/${userID}/yeahs/more?offset=${offset + posts.length}&pjax=true`
    }

    if(posts.length > 0)
    {
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
}
module.exports = router;
