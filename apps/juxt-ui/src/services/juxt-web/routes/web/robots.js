const express = require('express');
const path = require("path");
const router = express.Router();

router.get('/', function (req, res) {
    res.set("Content-Type", "text/css");
    res.sendFile('robots.txt', {root: path.join(__dirname, '../../../../webfiles/web')});
});


module.exports = router;
