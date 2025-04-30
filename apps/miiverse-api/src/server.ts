import express from 'express';
import expressMetrics from 'express-prom-bundle';
import { connect as connectDatabase } from '@/database';
import { logger } from '@/logger';
import { loggerHttp } from '@/loggerHttp';
import auth from '@/middleware/auth';
import discovery from '@/services/discovery';
import api from '@/services/api';
import { config } from '@/config';
import { ApiErrorCode, badRequest, serverError } from './errors';

const { http: { port }, metrics: { enabled: metricsEnabled, port: metricsPort } } = config;
const metrics = express();
const app = express();

// Metrics has to happen first so we can measure the other middleware
if (metricsEnabled) {
	logger.info('Setting up metrics');
	app.use(expressMetrics({
		// Include full express and nodejs metrics
		includeMethod: true,
		includePath: true,
		promClient: {
			collectDefaultMetrics: {}
		},

		// Keep metrics on a different app (so they aren't exposed)
		autoregister: false,
		metricsApp: metrics
	}));
}

app.set('etag', false);
app.disable('x-powered-by');

// Create router
logger.info('Setting up Middleware');
app.use(loggerHttp);
app.use(express.json());

app.use(express.urlencoded({
	extended: true,
	limit: '5mb',
	parameterLimit: 100000
}));
app.use(auth);

// import the servers into one
app.use(discovery);
app.use(api);

// 404 handler
logger.info('Creating 404 status handler');
app.use((_request: express.Request, response: express.Response) => {
	return badRequest(response, ApiErrorCode.NOT_FOUND, 404);
});

// non-404 error handler
logger.info('Creating non-404 status handler');
app.use((_error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
	return serverError(response, ApiErrorCode.UNKNOWN_ERROR);
});

async function main(): Promise<void> {
	// Starts the server
	logger.info('Starting server');

	await connectDatabase();

	app.listen(port, () => {
		logger.info(`Server started on port ${port}`);
	});

	if (metricsEnabled) {
		metrics.listen(metricsPort, () => {
			logger.info(`Metrics server started on port ${metricsPort}`);
		});
	}
}

process.title = 'Pretendo - Miiverse';
process.on('uncaughtException', (err) => {
	logger.fatal(err, 'Uncaught exception');
	process.exit(1);
});

main();
