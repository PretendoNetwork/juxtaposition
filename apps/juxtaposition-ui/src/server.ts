import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import 'express-async-errors'; // See package docs
import { database } from '@/database';
import { logger } from '@/logger';
import { loggerHttp } from '@/loggerHttp';
import { redisClient } from '@/redisCache';
import { router } from '@/services/juxt-web';
import { healthzRouter } from '@/services/healthz';
import { config } from '@/config';
import { jsxRenderer } from '@/middleware/jsx';
import { distFolder } from '@/util';
import { initImageProcessing } from '@/images';
import { loginWall } from '@/middleware/webAuth';
import { listenMetrics, registerMetrics } from '@/metrics';
import type { NextFunction, Request, Response } from 'express';
import type { FetchError } from '@/fetch';

// TODO is this used anywhere?
(BigInt as any).prototype['toJSON'] = function (): string {
	return this.toString();
};

process.title = 'Pretendo - Juxt-Web';
process.on('SIGTERM', () => {
	process.exit(0);
});

const { http: { port } } = config;
const app = express();

// Metrics has to happen first so we can measure the other middleware
const metricsApp = registerMetrics(app);

app.set('etag', false);
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(distFolder, '/webfiles'));
app.set('trust proxy', config.http.trustProxy);

// Create router
logger.info('Setting up Middleware');
app.use(jsxRenderer);
app.use(loggerHttp);
app.use(express.json());
app.use(healthzRouter);

app.use(express.urlencoded({
	extended: true,
	limit: '1mb'
}));

app.use(cookieParser());

app.use(session({
	store: new RedisStore({ client: redisClient }),
	secret: config.aesKey,
	resave: false,
	saveUninitialized: false
}));

// import the servers into one
app.use(router);

// 404 handler
logger.info('Creating 404 status handler');
app.use((req, res) => {
	req.log.warn('Page not found');
	res.status(404);
	return res.renderError({
		code: 404,
		message: 'Page not found'
	});
});

// non-404 error handler
logger.info('Creating non-404 status handler');
app.use((error: Error | FetchError, req: Request, res: Response, next: NextFunction) => {
	if (res.headersSent) {
		return next(error);
	}

	// small hack because token expiry is weird
	if ('status' in error && error.status === 401 && req.directory === 'web') {
		return loginWall(req, res);
	}

	const status = 'status' in error ? error.status ?? 500 : 500;
	res.status(status);

	req.log.error(error, 'Request failed!');
	return res.renderError({
		code: status,
		message: 'Error'
	});
});

// Starts the server
async function main(): Promise<void> {
	// Starts the server
	logger.info('Starting server');

	await database.connect();
	logger.success('Database connected');
	await redisClient.connect();
	await initImageProcessing();

	app.listen(port, '0.0.0.0', () => {
		logger.success(`Server started on port ${port}`);
	});

	listenMetrics(metricsApp);
}

process.on('uncaughtException', (err) => {
	logger.fatal(err, 'Uncaught exception');
	process.exit(1);
});

main();
