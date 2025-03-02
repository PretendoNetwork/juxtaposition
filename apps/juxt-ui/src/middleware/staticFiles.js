const util = require('../util');

async function staticFiles(request, response, next) {
    // Web files
    if(isStartOfPath(request.path, '/css/') ||
        isStartOfPath(request.path, '/fonts/') ||
        isStartOfPath(request.path, '/js/') ||
        request.path === '/favicon.ico' ||
        isStartOfPath(request.path, '/web/')  ||
        isStartOfPath(request.path, '/images/')  ||
        isStartOfPath(request.path, '/image/')) {

        request.lang = util.data.processLanguage();

        if(request.subdomains.includes('juxt'))
            request.directory = 'web';
        else
            request.directory = request.subdomains[1];
        return next()
    }
    else if(request.path === "/") {
        return response.redirect('/titles/show');
    }
    else
        return response.sendStatus(404);
}

function isStartOfPath(path, value) {
    return path.indexOf(value) === 0;
}


module.exports = staticFiles;
