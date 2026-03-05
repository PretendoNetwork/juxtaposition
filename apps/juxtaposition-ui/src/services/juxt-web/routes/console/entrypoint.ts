import express from 'express';
export const entrypointRouter = express.Router();

entrypointRouter.get('/', function (req, res) {
	res.redirect('/titles/show');
});
