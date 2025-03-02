const config = require('../../config.json');
const util = require('../util');
const moment = require("moment/moment");
const db = require('../database');

async function auth(request, response, next) {
    // Web files
    if(isStartOfPath(request.path, '/css/') ||
        isStartOfPath(request.path, '/fonts/') ||
        isStartOfPath(request.path, '/js/') ||
        request.path === '/favicon.ico' ||
        isStartOfPath(request.path, '/web/')  ||
        isStartOfPath(request.path, '/images/')  ||
        isStartOfPath(request.path, '/image/')) {
        request.lang = util.data.processLanguage();
        if(includes(request, 'juxt'))
            request.directory = 'web';
        else
            request.directory = includes(request, 'portal') ? 'portal' : 'ctr';
        return next()
    }

    // Get pid and fetch user data
    if(request.cookies.access_token) {
        try {
            request.user = await util.data.getUserDataFromToken(request.cookies.access_token);
        }
        catch(e) {
            return response.render('web/login.ejs', {toast: 'Unable to reach the account server. Try again later.', cdnURL: config.CDN_domain,});
        }
        request.pid = request.user ? request.user.pid : null;
    }
    else if(request.headers["x-nintendo-servicetoken"]) {
        request.pid = request.headers["x-nintendo-servicetoken"] ? await util.data.processServiceToken(request.headers["x-nintendo-servicetoken"]) : null;
        request.user = request.pid ? await util.data.getUserDataFromPid(request.pid) : null;
    }

    // Set headers
    request.paramPackData = request.headers["x-nintendo-parampack"] ? util.data.decodeParamPack(request.headers["x-nintendo-parampack"]) : null;
    response.header('X-Nintendo-WhiteList', config.whitelist);

    // Ban check
    if(request.user) {
		if (request.user.serverAccessLevel !== 'test' && request.user.serverAccessLevel !== 'dev') {
			response.status(500);
			return response.send('No access. Must be tester or dev');
		}
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

    // Juxt Website
    if(includes(request, 'juxt')) {
        request.lang = util.data.processLanguage();
        request.token = request.cookies.access_token;
        request.paramPackData = null;
        request.directory = 'web';

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
        if(!request.pid)
            return response.redirect('/login');

        return next();
    }
    else {
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
        request.directory = includes(request, 'portal') ? 'portal' : 'ctr';
        return next();
    }
}

function isStartOfPath(path, value) {
    return path.indexOf(value) === 0;
}

function includes(request, domain) {
    return request.subdomains.findIndex(element => element.includes(domain)) !== -1
}

module.exports = auth;
