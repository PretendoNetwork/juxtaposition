const pino = require('pino');
const pinoPretty = require('pino-pretty');
const { config } = require('./config');

const pretty = config.log.format == 'pretty'
	? pinoPretty({
			customPrettifiers: {
				// Clean up Express types for developer eyes
				req(req, _key, _log, { colors }) {
					return `${colors.bold(req.method)} ${req.headers.host}${req.url} (${req.remoteAddress}:${req.remotePort})`;
				},
				res(res, _key, _log, { colors }) {
					const color = (() => {
						if (res.statusCode >= 500) {
							return colors.red;
						} else if (res.statusCode >= 400) {
							return colors.yellow;
						} else if (res.statusCode >= 200) {
							return colors.green;
						} else {
							return colors.reset;
						}
					})();

					return `${color(res.statusCode)} (${res.headers['content-length']} bytes)`;
				}
			}
		})
	: undefined;

module.exports = pino({
	level: config.log.level,

	customLevels: {
		success: 35 // between INFO and WARN
	}
}, pretty);
