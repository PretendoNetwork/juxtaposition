const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const expressMetrics = require('express-prom-bundle');
const database = require('@/database');
const { logger } = require('@/logger');
const { loggerHttp } = require('@/loggerHttp');
const { redisClient } = require('@/redisCache');
const juxt_web = require('@/services/juxt-web');
const { healthzRouter } = require('@/services/healthz');
const { config } = require('@/config');
const { jsxRenderer } = require('@/middleware/jsx');

process.title = 'Pretendo - Juxt-Web';
process.on('SIGTERM', () => {
	process.exit(0);
});

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
		urlValueParser: {
			minBase64Length: 15
		},
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
app.set('view engine', 'ejs');
app.set('views', __dirname + '/webfiles');
app.set('trust proxy', config.http.trustProxy);
app.get('/ip', (request, response) => response.send(request.ip));

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
	saveUninitialized: false,
	ttl: 60
}));

// import the servers into one
app.use(juxt_web);

// 404 handler
logger.info('Creating 404 status handler');
app.use((req, res) => {
	req.log.warn('Page not found');
	res.render(req.directory + '/error.ejs', {
		code: 404,
		message: 'Page not found'
	});
});

// non-404 error handler
logger.info('Creating non-404 status handler');
app.use((error, request, response) => {
	const status = error.status || 500;

	response.status(status);

	response.json({
		app: 'api',
		status,
		error: error.message
	});
});

// Starts the server
async function main() {
	// Starts the server
	logger.info('Starting server');

	await database.connect();
	logger.success('Database connected');
	await redisClient.connect();

	app.listen(port, () => {
		logger.success(`Server started on port ${port}`);
	});

	if (metricsEnabled) {
		metrics.listen(metricsPort, () => {
			logger.success(`Metrics server started on port ${metricsPort}`);
		});
	}
}

process.on('uncaughtException', (err) => {
	logger.fatal(err, 'Uncaught exception');
	process.exit(1);
});

main();
