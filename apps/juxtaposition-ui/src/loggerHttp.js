const pinoHttp = require('pino-http');
const logger = require('./logger');
const { config } = require('./config');
const { decodeParamPack } = require('./util');

function redactHeaders(headers, allowlist) {
	if (config.log.redact) {
		return Object.fromEntries(Object.keys(headers).map(key =>
			allowlist.includes(key) ? [key, headers[key]] : [key, '[redacted]']
		));
	} else {
		// The redaction case does a clone, so keep the semantics the same
		return Object.assign({}, headers);
	}
}

module.exports = pinoHttp({
	logger: logger,
	serializers: {
		req(req) {
			// Only log non-sensitive headers
			const allowlist = ['host', 'accept', 'accept-encoding', 'accept-language', 'user-agent', 'referer', 'x-nintendo-parampack'];
			req.headers = redactHeaders(req.headers, allowlist);

			// Decode param pack if we have it
			if ('x-nintendo-parampack' in req.headers) {
				req.headers['x-nintendo-parampack'] = decodeParamPack(req.headers['x-nintendo-parampack']);
			}

			return req;
		},
		res(res) {
			// Only log non-sensitive headers
			const allowlist = ['content-type', 'content-length', 'x-nintendo-whitelist'];
			res.headers = redactHeaders(res.headers, allowlist);

			return res;
		}
	}
});
