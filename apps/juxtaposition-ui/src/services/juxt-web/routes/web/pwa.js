const path = require('path');
const express = require('express');
const router = express.Router();

router.get('/icons/:filename', function (req, res) {
	res.set('Content-Type', 'image/png');
	res.sendFile('/images/icons/' + req.params.filename, { root: path.join(__dirname, '../../../../webfiles/web') });
});

router.get('/manifest.json', function (req, res) {
	res.set('Content-Type', 'text/json');
	res.sendFile('manifest.json', { root: path.join(__dirname, '../../../../webfiles/web') });
});

module.exports = router;
