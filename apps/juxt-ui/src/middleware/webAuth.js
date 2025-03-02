const config = require('../../config.json');
const util = require('../util');
const moment = require("moment/moment");
const db = require('../database');

async function auth(request, response, next) {
    // Get pid and fetch user data
    request.lang = util.data.processLanguage();
    request.paramPackData = null;
    request.directory = 'web';
    request.token = request.cookies.access_token;
    if(request.cookies.access_token) {
        try {
            request.user = await util.data.getUserDataFromToken(request.token);
        }
        catch(e) {
            console.log(e);
            if(request.path === "/login") {
                return next();
            }
            return response.render('web/login.ejs', {toast: 'Unable to reach the account server. Try again later.', cdnURL: config.CDN_domain,});
        }
        request.pid = request.user ? request.user.pid : null;
    }

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
            return response.render('web/login.ejs', {toast: 'Your account has been suspended. For more information, log into https://pretendo.network/account', cdnURL: config.CDN_domain,});
        }
    }

    // Open access pages
    if(isStartOfPath(request.path, '/users/') ||
        (isStartOfPath(request.path, '/titles/') && request.path !== '/titles/show') ||
        (isStartOfPath(request.path, '/posts/') && !request.path.includes('/empathy'))) {
        if(!request.pid)
            request.pid = 1000000000;
        return next();
    }
    // Login endpoint
    if(request.path === '/login') {
        if(request.pid)
            return response.redirect('/titles/show?src=login');
        return next();
    }
    console.log(request.route);
    if(!request.user && request.path !== '/')
        return response.redirect('/login');

    return next();
}

function isStartOfPath(path, value) {
    return path.indexOf(value) === 0;
}

module.exports = auth;
