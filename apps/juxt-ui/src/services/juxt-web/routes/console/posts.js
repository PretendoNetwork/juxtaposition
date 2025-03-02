const express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const {POST} = require('../../../../models/post');
const multer = require('multer');
const moment = require('moment');
const rateLimit = require('express-rate-limit')
const {REPORT} = require("../../../../models/report");
const upload = multer({dest: 'uploads/'});
const crypto = require('crypto')
const router = express.Router();

const postLimit = rateLimit({
    windowMs: 15 * 1000, // 30 seconds
    max: 10, // Limit each IP to 1 request per `window`
    standardHeaders: true,
    legacyHeaders: true,
    message: "New post limit reached. Try again in a minute",
    handler: function (req, res) {
        if (req.params.post_id)
            res.redirect('/posts/' + req.params.post_id.toString());
        else if (req.body.community_id)
            res.redirect('/titles/' + req.body.community_id);
        else {
            res.render(req.directory + '/error.ejs', {
                code: 429,
                message: "Too many new posts have been created.",
                cdnURL: config.CDN_domain,
                lang: req.lang,
                pid: req.pid
            });
        }
    },
})

const yeahLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 60 requests per `window`
    standardHeaders: true,
    legacyHeaders: true,
})

router.post('/empathy', yeahLimit, async function (req, res) {
    let post = await database.getPostByID(req.body.postID);
    if (!post)
        return res.sendStatus(404);
    if (post.yeahs.indexOf(req.pid) === -1) {
        await POST.updateOne({
                id: post.id,
                yeahs: {
                    $ne: req.pid
                }
            },
            {
                $inc: {
                    empathy_count: 1
                },
                $push: {
                    yeahs: req.pid
                }
            });
        res.send({status: 200, id: post.id, count: post.empathy_count + 1});
        if (req.pid !== post.pid)
            await util.data.newNotification({
                pid: post.pid,
                type: "yeah",
                objectID: post.id,
                userPID: req.pid,
                link: `/posts/${post.id}`
            });
    } else if (post.yeahs.indexOf(req.pid) !== -1) {
        await POST.updateOne({
                id: post.id,
                yeahs: {
                    $eq: req.pid
                }
            },
            {
                $inc: {
                    empathy_count: -1
                },
                $pull: {
                    yeahs: req.pid
                }
            });
        res.send({status: 200, id: post.id, count: post.empathy_count - 1});
    } else
        res.send({status: 423, id: post.id, count: post.empathy_count});
});

router.post('/new', postLimit, upload.none(), async function (req, res) {
    await newPost(req, res)
});

router.get('/:post_id', async function (req, res) {
    let userSettings = await database.getUserSettings(req.pid);
    let userContent = await database.getUserContent(req.pid);
    let post = await database.getPostByID(req.params.post_id.toString());
    if (post === null) return res.redirect('/404');
    if (post.parent) {
        post = await database.getPostByID(post.parent);
        if (post === null)
            return res.sendStatus(404);
        return res.redirect(`/posts/${post.id}`);
    }
    let community = await database.getCommunityByID(post.community_id);
    let communityMap = await util.data.getCommunityHash();
    let replies = await database.getPostReplies(req.params.post_id.toString(), 25)
    res.render(req.directory + '/post.ejs', {
        moment: moment,
        userSettings: userSettings,
        userContent: userContent,
        post: post,
        replies: replies,
        community: community,
        communityMap: communityMap,
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid,
        moderator: req.moderator
    });
});

router.delete('/:post_id', async function (req, res) {
    let post = await database.getPostByID(req.params.post_id);
    if(!post) return res.sendStatus(404);
    if(req.pid !== post.pid && !req.moderator) return res.sendStatus(401);
    if(req.moderator && req.pid !== post.pid)
        await post.removePost(req.query.reason ? req.query.reason : 'Removed by moderator', req.pid);
    else
        await post.removePost('User requested removal', req.pid);

    res.statusCode = 200;
    if(post.parent)
        res.send(`/posts/${post.parent}`);
    else
        res.send('/users/me');
});

router.post('/:post_id/new', postLimit, upload.none(), async function (req, res) {
    await newPost(req, res);
});

router.post('/:post_id/report', upload.none(), async function (req, res) {
    const { reason, message, post_id } = req.body;
    const post = await database.getPostByID(post_id);
    if(!reason || !post_id || !post)
        return res.redirect('/404');

    const reportDoc = {
        pid: post.pid,
        reported_by: req.pid,
        post_id,
        reason,
        message,
        created_at: new Date()
    }

    const reportObj = new REPORT(reportDoc);
    await reportObj.save();

    return res.redirect(`/posts/${post.id}`);
});

async function newPost(req, res) {
    let userSettings = await database.getUserSettings(req.pid), parentPost = null, postID = await generatePostUID(21);
    let community = await database.getCommunityByID(req.body.community_id);
    if (!community || !userSettings || !req.user) {
        res.status(403);
        console.log('missing data')
        return res.redirect(`/titles/show`);
    }
    if (req.params.post_id && (req.body.body === '' && req.body.painting === '' && req.body.screenshot === '')) {
        res.status(422);
        return res.redirect('/posts/' + req.params.post_id.toString());
    }
    if (req.params.post_id) {
        parentPost = await database.getPostByID(req.params.post_id.toString());
        if (!parentPost)
            return res.sendStatus(403);
    }
    if (!(community.admins && community.admins.indexOf(req.pid) !== -1 && userSettings.account_status === 0)
        && (community.type >= 2) && !(parentPost && community.allows_comments && community.open)) {
        res.status(403);
        return res.redirect(`/titles/${community.olive_community_id}/new`);
    }

    let painting = "", paintingURI = "", screenshot = null;
    if (req.body._post_type === 'painting' && req.body.painting) {
        if(req.body.bmp === 'true')
            painting = await util.data.processPainting(req.body.painting.replace(/\0/g, "").trim(), false);
        else
            painting = req.body.painting;
        paintingURI = await util.data.processPainting(painting, true);
        await util.data.uploadCDNAsset('pn-cdn', `paintings/${req.pid}/${postID}.png`, paintingURI, 'public-read');
    }
    if (req.body.screenshot) {
        screenshot = req.body.screenshot.replace(/\0/g, "").trim();
        await util.data.uploadCDNAsset('pn-cdn', `screenshots/${req.pid}/${postID}.jpg`, Buffer.from(screenshot, 'base64'), 'public-read');
    }

    let miiFace;
    switch (parseInt(req.body.feeling_id)) {
        case 1:
            miiFace = 'smile_open_mouth.png';
            break;
        case 2:
            miiFace = 'wink_left.png';
            break;
        case 3:
            miiFace = 'surprise_open_mouth.png';
            break;
        case 4:
            miiFace = 'frustrated.png';
            break;
        case 5:
            miiFace = 'sorrow.png';
            break;
        default:
            miiFace = 'normal_face.png';
            break;
    }
    let body = req.body.body;
    if (body)
        body = req.body.body.replace(/[^A-Za-z\d\s-_!@#$%^&*(){}‛¨ƒºª«»“”„¿¡←→↑↓√§¶†‡¦–—⇒⇔¤¢€£¥™©®+×÷=±∞ˇ˘˙¸˛˜′″µ°¹²³♭♪•…¬¯‰¼½¾♡♥●◆■▲▼☆★♀♂,./?;:'"\\<>]/g, "");
    if (body.length > 280)
        body = body.substring(0, 280);
    const document = {
        title_id: community.title_id[0],
        community_id: community.olive_community_id,
        screen_name: userSettings.screen_name,
        body: body,
        painting: painting,
        screenshot: screenshot ? `/screenshots/${req.pid}/${postID}.jpg` : "",
        country_id: req.paramPackData ? req.paramPackData.country_id : 49,
        created_at: new Date(),
        feeling_id: req.body.feeling_id,
        id: postID,
        is_autopost: 0,
        is_spoiler: (req.body.spoiler) ? 1 : 0,
        is_app_jumpable: req.body.is_app_jumpable,
        language_id: req.body.language_id,
        mii: req.user.mii.data,
        mii_face_url: `https://mii.olv.pretendo.cc/mii/${req.user.pid}/${miiFace}`,
        pid: req.pid,
        platform_id: req.paramPackData ? req.paramPackData.platform_id : 0,
        region_id: req.paramPackData ? req.paramPackData.region_id : 2,
        verified: req.moderator,
        parent: parentPost ? parentPost.id : null,
        moderator: req.moderator
    };
    let duplicatePost = await database.getDuplicatePosts(req.pid, document);
    if (duplicatePost && req.params.post_id)
        return res.redirect('/posts/' + req.params.post_id.toString());
    if (document.body === '' && document.painting === '' && document.screenshot === '')
        return res.redirect('/titles/' + community.olive_community_id + '/new');
    const newPost = new POST(document);
    newPost.save();
    if (parentPost) {
        parentPost.reply_count = parentPost.reply_count + 1;
        parentPost.save();
    }
    if (parentPost && (parentPost.pid !== req.user.pid))
        await util.data.newNotification({
            pid: parentPost.pid,
            type: "reply",
            user: req.pid,
            link: `/posts/${parentPost.id}`
        });
    if (parentPost)
        res.redirect('/posts/' + req.params.post_id.toString());
    else
        res.redirect('/titles/' + community.olive_community_id + '/new');
}

async function generatePostUID(length) {
    let id = Buffer.from(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length * 2))), 'binary').toString('base64').replace(/[+/]/g, "").substring(0, length);
    const inuse = await POST.findOne({id});
    id = (inuse ? await generatePostUID() : id);
    return id;
}


module.exports = router;
