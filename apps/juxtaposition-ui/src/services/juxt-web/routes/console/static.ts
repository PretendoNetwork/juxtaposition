import path from 'path';
import express from 'express';
import { distFolder } from '@/util';
export const staticRouter = express.Router();

// Normal asset files
const webFilesRoot = path.join(distFolder, 'webfiles');
const assetsStaticRouter = express.Router();
assetsStaticRouter.use(express.static(webFilesRoot));
assetsStaticRouter.use((req, res, _next) => {
	res.sendStatus(404); // 404 for only /assets
});
staticRouter.use('/assets', assetsStaticRouter);

// Global files, served on the root of the domain
const webFilesGlobalRoot = path.join(distFolder, 'webfiles', 'global');
staticRouter.use('/', express.static(webFilesGlobalRoot));

// Some notification database entries use hardcoded paths to images, will need a migration.
// Once that has been updated, this route can be removed
staticRouter.use('/images', (req, res, next) => {
	const directory = req.directory ?? 'web';
	const fileRoot = path.join(distFolder, 'webfiles', directory, 'images');
	return express.static(fileRoot)(req, res, next);
});
