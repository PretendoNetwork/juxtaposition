import * as path from 'path';
import * as express from 'express';

export const robotsRouter = express.Router();

robotsRouter.get('/', function (req, res) {
	res.set('Content-Type', 'text/css');
	res.sendFile('robots.txt', { root: path.join(__dirname, '../../../../webfiles/web') });
});
