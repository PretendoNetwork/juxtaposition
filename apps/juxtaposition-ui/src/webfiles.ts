import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { distFolder } from '@/util';

export const webFilesRoot = path.join(distFolder, 'webfiles');

const assetsPrefix = '/assets/';
const hashCache = new Map<string, string | null>();

/**
 * Short content hash of a file on disk, or null if it can't be read.
 * Cached forever, webfiles are built before the server starts and don't change at runtime.
 */
export function getWebFileHash(filePath: string): string | null {
	const cached = hashCache.get(filePath);
	if (cached !== undefined) {
		return cached;
	}

	let hash: string | null;
	try {
		hash = createHash('sha1').update(readFileSync(filePath)).digest('hex').slice(0, 12);
	} catch {
		hash = null;
	}

	hashCache.set(filePath, hash);
	return hash;
}

/**
 * Adds a content hash to an asset URL (e.g. `/assets/web/css/web.css?v=abc123`).
 * The URL changes whenever the file does, so browsers and Cloudflare pick up new CSS/JS right after a release.
 */
export function assetUrl(url: `${typeof assetsPrefix}${string}`): string {
	const hash = getWebFileHash(path.join(webFilesRoot, url.slice(assetsPrefix.length)));
	return hash ? `${url}?v=${hash}` : url;
}
