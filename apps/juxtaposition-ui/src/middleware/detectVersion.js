const util = require('../util');

async function detectVersion(request, response, next) {
	request.timerDate = Date.now();
	// Check the domain and set the directory
	if (includes(request, 'juxt')) {
		request.directory = 'web';
		response.locals.lang = util.processLanguage();
	} else {
		request.directory = includes(request, 'portal') ? 'portal' : 'ctr';
	}

	request.isWrite = request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE';

	next();
}

function includes(request, domain) {
	return request.subdomains.findIndex(element => element.includes(domain)) !== -1;
}

module.exports = detectVersion;
