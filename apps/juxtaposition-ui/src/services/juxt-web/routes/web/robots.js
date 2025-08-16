import path from 'path';
import express from 'express';
import { distFolder } from '@/util';

export const robotsRouter = express.Router();

robotsRouter.get('/', function (req, res) {
	res.set('Content-Type', 'text/css');
	res.sendFile('robots.txt', { root: path.join(distFolder, '/webfiles/web') });
});
