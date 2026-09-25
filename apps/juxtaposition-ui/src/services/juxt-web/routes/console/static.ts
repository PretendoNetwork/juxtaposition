import path from 'path';
import express from 'express';
import { distFolder } from '@/util';
import { getWebFileHash, webFilesRoot } from '@/webfiles';
export const staticRouter = express.Router();

// Normal asset files
const assetsStaticRouter = express.Router();
assetsStaticRouter.use(express.static(webFilesRoot, {
	setHeaders(res, filePath) {
		// URLs from assetUrl() carry a content hash, so they can be cached forever.
		// Only trust the hash if it matches the file we're serving, otherwise a mismatched
		// release (rolling deploy, stale HTML) could get the wrong file cached under that URL.
		const version = res.req.query.v;
		if (typeof version === 'string' && version === getWebFileHash(filePath)) {
			res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
		} else {
			res.setHeader('Cache-Control', 'no-cache');
		}
	}
}));
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
