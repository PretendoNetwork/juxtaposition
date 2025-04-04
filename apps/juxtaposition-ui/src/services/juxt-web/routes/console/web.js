const path = require('path');
const express = require('express');
const router = express.Router();

//* Keep the cache for 1 hour
const maxAge = 60 * 60;

router.get('/', function (req, res) {
	res.redirect('/titles/show');
});

router.get('/css/:filename', function (req, res) {
	res.set('Content-Type', 'text/css');
	res.set('Cache-Control', `public, max-age=${maxAge}`);
	res.sendFile('/css/' + req.params.filename, { root: path.join(__dirname, '../../../../webfiles/' + req.directory) });
});

router.get('/js/:filename', function (req, res) {
	res.set('Content-Type', 'application/javascript; charset=utf-8');
	res.set('Cache-Control', `public, max-age=${maxAge}`);
	res.sendFile('/js/' + req.params.filename, { root: path.join(__dirname, '../../../../webfiles/' + req.directory) });
});

router.get('/images/:filename', function (req, res) {
	res.set('Content-Type', 'image/png');
	res.set('Cache-Control', `public, max-age=${maxAge}`);
	res.sendFile('/images/' + req.params.filename, { root: path.join(__dirname, '../../../../webfiles/' + req.directory) });
});

router.get('/fonts/:filename', function (req, res) {
	res.set('Content-Type', 'font/woff');
	res.set('Cache-Control', `public, max-age=${maxAge}`);
	res.sendFile('/fonts/' + req.params.filename, { root: path.join(__dirname, '../../../../webfiles/' + req.directory) });
});

router.get('/favicon.ico', function (req, res) {
	res.set('Content-Type', 'image/x-icon');
	res.set('Cache-Control', `public, max-age=${maxAge}`);
	res.sendFile('/images/favicon.ico', { root: path.join(__dirname, '../../../../webfiles/' + req.directory) });
});

module.exports = router;
