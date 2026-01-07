import path from 'path';
import express from 'express';
import { distFolder } from '@/util';

export const pwaRouter = express.Router();

pwaRouter.get('/icons/:filename', function (req, res) {
	res.set('Content-Type', 'image/png');
	res.sendFile('/images/icons/' + req.params.filename, { root: path.join(distFolder, '/webfiles/web') });
});

pwaRouter.get('/manifest.json', function (req, res) {
	res.set('Content-Type', 'text/json');
	res.sendFile('manifest.json', { root: path.join(distFolder, '/webfiles/web') });
});
