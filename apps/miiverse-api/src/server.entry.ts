import '@/extend-zod'; // Needs to be the first import
import express from 'express';
import { connect as connectDatabase } from '@/database';
import { logger } from '@/logger';
import { loggerHttp } from '@/loggerHttp';
import auth from '@/middleware/auth';
import discovery from '@/services/discovery';
import api from '@/services/api';
import { healthzRouter } from '@/services/healthz';
import { config } from '@/config';
import { setupGrpc } from '@/services/internal/server';
import { initImageProcessing } from '@/images';
import { ApiErrorCode, badRequest, serverError } from '@/errors';
import { connectGrpc } from '@/grpc';
import { setupS3 } from '@/s3';
import { listenMetrics, registerMetrics } from '@/metrics';

const app = express();

// Metrics has to happen first so we can measure the other middleware
const metricsApp = registerMetrics(app);

app.set('etag', false);
app.set('trust proxy', config.http.trustProxy);
app.disable('x-powered-by');

// Create router
logger.info('Setting up Middleware');
app.use(loggerHttp);
app.use(express.json());
app.use(healthzRouter);

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
app.use((error: unknown, request: express.Request, response: express.Response, next: express.NextFunction) => {
	if (response.headersSent) {
		return next(error);
	}

	request.log.error(error, 'Request failed!');
	return serverError(response, ApiErrorCode.UNKNOWN_ERROR);
});

async function main(): Promise<void> {
	// Starts the server
	logger.info('Starting server');

	setupS3();
	connectGrpc();
	await connectDatabase();
	await initImageProcessing();

	app.listen(config.http.port, '0.0.0.0', () => {
		logger.info(`Server started on port ${config.http.port}`);
	});
	listenMetrics(metricsApp);

	await setupGrpc();
}

process.title = 'Pretendo - Miiverse';
process.on('uncaughtException', (err) => {
	logger.fatal(err, 'Uncaught exception');
	process.exit(1);
});

main().catch((err) => {
	logger.fatal(err, 'Uncaught exception');
	process.exit(1);
});
