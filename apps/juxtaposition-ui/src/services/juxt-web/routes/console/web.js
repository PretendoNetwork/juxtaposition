import path from 'path';
import express from 'express';
import { distFolder } from '@/util';
export const webRouter = express.Router();

//* Keep the cache for 1 hour
const maxAge = 60 * 60;

webRouter.get('/', function (req, res) {
	res.redirect('/titles/show');
});

webRouter.get('/css/:filename', function (req, res) {
	res.set('Content-Type', 'text/css');
	res.set('Cache-Control', `public, max-age=${maxAge}`);
	res.sendFile('/css/' + req.params.filename, { root: path.join(distFolder, 'webfiles', req.directory) });
});

webRouter.get('/js/:filename', function (req, res) {
	res.set('Content-Type', 'application/javascript; charset=utf-8');
	res.set('Cache-Control', `public, max-age=${maxAge}`);
	res.sendFile('/js/' + req.params.filename, { root: path.join(distFolder, 'webfiles', req.directory) });
});

webRouter.get('/images/:filename', function (req, res) {
	res.set('Content-Type', 'image/png');
	res.set('Cache-Control', `public, max-age=${maxAge}`);
	res.sendFile('/images/' + req.params.filename, { root: path.join(distFolder, 'webfiles', req.directory) });
});

webRouter.get('/fonts/:filename', function (req, res) {
	res.set('Content-Type', 'font/woff');
	res.set('Cache-Control', `public, max-age=${maxAge}`);
	res.sendFile('/fonts/' + req.params.filename, { root: path.join(distFolder, 'webfiles', req.directory) });
});

webRouter.get('/favicon.ico', function (req, res) {
	res.set('Content-Type', 'image/x-icon');
	res.set('Cache-Control', `public, max-age=${maxAge}`);
	res.sendFile('/images/favicon.ico', { root: path.join(distFolder, 'webfiles', req.directory) });
});
