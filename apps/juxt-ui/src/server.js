process.title = 'Pretendo - Juxt-Web';
const express = require('express');
const morgan = require('morgan');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');
const database = require('./database');
const logger = require('./logger');
const config = require('../config.json');

const { http: { port } } = config;
const app = express();

const juxt_web = require('./services/juxt-web');

app.set('etag', false);
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', __dirname + '/webfiles');
app.set('trust proxy', 2)
app.get('/ip', (request, response) => response.send(request.ip))

// Create router
logger.info('Setting up Middleware');
app.use(morgan('dev'));
app.enable("trust proxy");
app.use(express.json());

app.use(express.urlencoded({
    extended: true,
    limit: '1mb',
}));

app.use(cookieParser());
app.use(auth);


// import the servers into one
app.use(juxt_web);

// 404 handler
logger.info('Creating 404 status handler');
app.use((req, res) => {
    logger.warn(req.protocol + '://' + req.get('host') + req.originalUrl);
    res.render(req.directory + '/error.ejs', {
        code: 404,
        message: "Page not found",
        cdnURL: config.CDN_domain,
        lang: req.lang,
        pid: req.pid
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
logger.info('Starting server');

database.connect().then(() => {
    app.listen(port, () => {
        logger.success(`Server started on port ${port}`);
    });
});
