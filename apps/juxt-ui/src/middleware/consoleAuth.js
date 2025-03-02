const config = require('../../config.json');
const util = require('../util');
const moment = require("moment/moment");
const db = require('../database');

async function auth(request, response, next) {
    // Get pid and fetch user data
    if(request.headers["x-nintendo-servicetoken"]) {
        request.pid = request.headers["x-nintendo-servicetoken"] ? await util.data.processServiceToken(request.headers["x-nintendo-servicetoken"]) : null;
        request.user = request.pid ? await util.data.getUserDataFromPid(request.pid) : null;
    }

    // Set headers
    request.paramPackData = request.headers["x-nintendo-parampack"] ? util.data.decodeParamPack(request.headers["x-nintendo-parampack"]) : null;
    response.header('X-Nintendo-WhiteList', config.whitelist);

    // Ban check
    if(request.user) {
        // Set moderator status
        request.moderator = request.user.accessLevel >= 2;
        const user = await db.getUserSettings(request.pid);
        if(user && moment(user.ban_lift_date) <= moment() && user.account_status !== 3) {
            user.account_status = 0;
            await user.save()
        }
        // This includes ban checks for both Juxt specifically and the account server, ideally this should be squashed
        // assuming we support more gradual bans on PNID's
        if(user && (user.account_status < 0 || user.account_status > 1 || request.user.accessLevel < 0))
        {
            response.render(request.directory + '/partials/ban_notification.ejs', {
                user: user,
                moment: moment,
                cdnURL: config.CDN_domain,
                lang: request.lang,
                pid: request.pid
            });
        }
    }

    // This section includes checks if a user is a developer and adds exceptions for these cases
    if(!request.pid) {
        return response.render('portal/partials/ban_notification.ejs', {
            user: null,
            error: "Unable to parse service token. Are you using a Nintendo Network ID?"
        });
    }
    if(request.user.accessLevel < 3 && !request.paramPackData) {
        return response.render('portal/partials/ban_notification.ejs', {
            user: null,
            error: "Missing auth headers"
        });
    }
    if(!request.user) {
        return response.render('portal/partials/ban_notification.ejs', {
            user: null,
            error: "Unable to fetch user data. Please try again later."
        });
    }
    let userAgent = request.headers['user-agent'];
    if(request.user.accessLevel < 3 && (request.cookies.access_token || (!userAgent.includes('Nintendo WiiU') && !userAgent.includes('Nintendo 3DS'))))
        return response.render('portal/partials/ban_notification.ejs', {
            user: null,
            error: "Invalid authentication method used."
        });

    request.lang = util.data.processLanguage(request.paramPackData);
    request.directory = request.subdomains[1];
    return next();
}

module.exports = auth;
