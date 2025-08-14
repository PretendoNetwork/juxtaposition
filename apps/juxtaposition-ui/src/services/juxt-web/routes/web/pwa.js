import * as path from 'path';
import * as express from 'express';

export const pwaRouter = express.Router();

pwaRouter.get('/icons/:filename', function (req, res) {
	res.set('Content-Type', 'image/png');
	res.sendFile('/images/icons/' + req.params.filename, { root: path.join(__dirname, '../../../../webfiles/web') });
});

pwaRouter.get('/manifest.json', function (req, res) {
	res.set('Content-Type', 'text/json');
	res.sendFile('manifest.json', { root: path.join(__dirname, '../../../../webfiles/web') });
});
