import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { ColorType, FilterType, Gravity, ImageMagick, initializeImageMagick, Interlace, MagickColors, Orientation } from '@imagemagick/magick-wasm';
import { deflate, inflate } from 'pako';
import { logger } from '@/logger';
import { uploadCDNAsset } from '@/util';
import type { IMagickImage } from '@imagemagick/magick-wasm';

export type Painting = {
	png: Buffer;
	tgaz: Buffer;
};

function processPainting(image: IMagickImage): Painting | null {
	image.crop(320, 120);
	// Paintings only have black pixels and white pixels
	// Notifying the codec of this gets good compression gains!
	image.colorType = ColorType.Bilevel;
	// Remove EXIF whatever
	image.strip();

	// Tuned to match pngcrush on bilevel painting data
	image.settings.setDefine('PNG', 'compression-level', 9);
	image.settings.setDefine('PNG', 'compression-filter', 0);
	image.settings.setDefine('PNG', 'compression-strategy', 1);

	return {
		png: image.write('PNG', Buffer.from),
		tgaz: image.clone((image) => {
			// Ingame TGA decoders don't support all the fun stuff.
			image.colorType = ColorType.TrueColorAlpha;
			// Only this orientation is supported.
			image.orientation = Orientation.BottomLeft;
			image.flip();

			return image.write('TGA', (tga) => {
				const tgaz = deflate(tga, { level: 6 });
				return Buffer.from(tgaz);
			});
		})
	};
}

/**
 * Processes, sanitises and converts BMP-format paintings.
 * @param painting Buffer of BMP painting.
 * @returns PNG and TGAZ-encoded paintings.
 */
export function processBmpPainting(painting: Buffer): Painting | null {
	return ImageMagick.read(painting, 'BMP', processPainting);
}
/**
 * Processes, sanitises and converts TGAZ-format paintings.
 * @param painting Buffer of TGAZ painting.
 * @returns PNG and TGAZ-encoded paintings.
 */
export function processTgazPainting(painting: Buffer): Painting | null {
	const tga = inflate(painting);
	return ImageMagick.read(tga, 'TGA', processPainting);
}

/**
 * Processes and uploads a new painting to the CDN - to paintings/${pid}/${postID}.png.
 * @param paintingBlob base64 TGAZ or BMP blob from the client request body.
 * @param bmp 'true' if the image should be decoded as BMP (as on 3DS).
 * @param pid Poster PID.
 * @param postID Post ID.
 * @returns base64 TGAZ blob, sanitised.
 */
export async function uploadPainting(paintingBlob: string, bmp: string, pid: number, postID: string): Promise<string | null> {
	const paintingBuf = Buffer.from(paintingBlob.replace(/\0/g, '').trim(), 'base64');
	const paintings = bmp === 'true' ? processBmpPainting(paintingBuf) : processTgazPainting(paintingBuf);
	if (paintings === null) {
		return null;
	}

	if (!await uploadCDNAsset(`paintings/${pid}/${postID}.png`, paintings.png, 'public-read')) {
		return null;
	}

	return paintings.tgaz.toString('base64');
}

export type Aspect = '16:9' | '5:4' | '4:3';

export type Screenshot = {
	jpg: Buffer;
	thumb: Buffer;
	aspect: Aspect;
};

type ScreenshotRes = {
	// full res
	w: number;
	h: number;
	// thumbnail res
	tw: number;
	th: number;
	// other
	aspect: Aspect;
};

const validResolutions: ScreenshotRes[] = [
	{ w: 800, h: 450, tw: 320, th: 180, aspect: '16:9' },
	{ w: 400, h: 240, tw: 320, th: 192, aspect: '5:4' },
	{ w: 320, h: 240, tw: 320, th: 240, aspect: '4:3' },
	{ w: 640, h: 480, tw: 320, th: 240, aspect: '4:3' }
];

function processScreenshot(image: IMagickImage): Screenshot | null {
	const res = validResolutions.find(({ w, h }) => w === image.width && h === image.height);
	if (res === undefined) {
		return null;
	}
	// Remove EXIF whatever
	image.strip();

	image.quality = 85;
	image.settings.setDefine('JPEG', 'sampling-factor', '2x2');
	image.settings.interlace = Interlace.Jpeg;

	return {
		jpg: image.write('JPEG', Buffer.from),
		thumb: image.clone((image) => {
			image.filterType = FilterType.Lanczos2;
			image.resize(res.tw, res.th);
			image.extent(res.tw, res.th, Gravity.Center);
			image.quality = 75; // smash 'em
			return image.write('JPEG', Buffer.from);
		}),
		aspect: res.aspect
	};
}

export function processJpgScreenshot(painting: Buffer): Screenshot | null {
	return ImageMagick.read(painting, 'JPG', processScreenshot);
}

export type ScreenshotUrls = {
	full: string;
	thumb: string;
	aspect: Aspect;
};

export async function uploadScreenshot(screenshotBlob: string, pid: number, postID: string): Promise<ScreenshotUrls | null> {
	const screenshotBuf = Buffer.from(screenshotBlob.replace(/\0/g, '').trim(), 'base64');
	const screenshots = processJpgScreenshot(screenshotBuf);
	if (screenshots === null) {
		return null;
	}

	const full = `/screenshots/${pid}/${postID}.jpg`;
	const thumb = `/screenshots/${pid}/${postID}-thumb.jpg`;

	if (!await uploadCDNAsset(full, screenshots.jpg, 'public-read')) {
		return null;
	}

	if (!await uploadCDNAsset(thumb, screenshots.thumb, 'public-read')) {
		return null;
	}

	return { full, thumb, aspect: screenshots.aspect };
}

type Icon = {
	icon32: Buffer;
	icon64: Buffer;
	icon128: Buffer;
	tga: Buffer;
};

function processIcon(image: IMagickImage): Icon | null {
	if (image.width < 128 || image.height !== image.width) {
		return null;
	}
	image.colorType = ColorType.Palette;
	image.strip();
	// Just feels right bro
	image.settings.setDefine('PNG', 'compression-level', 9);
	image.settings.setDefine('PNG', 'compression-filter', 0);
	image.settings.setDefine('PNG', 'compression-strategy', 0);

	return {
		icon32: image.clone((image) => {
			image.resize(32, 32);
			return image.write('PNG', Buffer.from);
		}),
		icon64: image.clone((image) => {
			image.resize(64, 64);
			return image.write('PNG', Buffer.from);
		}),
		icon128: image.clone((image) => {
			image.resize(128, 128);
			return image.write('PNG', Buffer.from);
		}),
		tga: image.clone((image) => {
			image.resize(128, 128);
			// Ingame TGA decoders don't support all the fun stuff.
			image.colorType = ColorType.TrueColorAlpha;
			// Only this orientation is supported.
			image.orientation = Orientation.BottomLeft;
			image.flip();

			return image.write('TGA', (tga) => {
				const tgaz = deflate(tga, { level: 6 });
				return Buffer.from(tgaz);
			});
		})
	};
}

export type IconUrls = {
	icon32: string;
	icon64: string;
	icon128: string;
	tgaBlob: string;
};

export async function uploadIcons(icon: Buffer, communityID: string): Promise<IconUrls | null> {
	const icons = ImageMagick.read(icon, 'PNG', processIcon);
	if (icons === null) {
		return null;
	}

	const icon32 = `/icons/${communityID}/32.png`;
	const icon64 = `/icons/${communityID}/64.png`;
	const icon128 = `/icons/${communityID}/128.png`;

	if (!await uploadCDNAsset(icon32, icons.icon32, 'public-read') ||
		!await uploadCDNAsset(icon64, icons.icon64, 'public-read') ||
		!await uploadCDNAsset(icon128, icons.icon128, 'public-read')) {
		return null;
	}

	return {
		icon32,
		icon64,
		icon128,
		tgaBlob: icons.tga.toString('base64')
	};
}

function processCtrHeader(image: IMagickImage): Buffer | null {
	// full height banners are 220, non-title ones are 168
	if (image.width !== 400 || (image.height !== 220 && image.height !== 168)) {
		return null;
	}

	// add white pixels to get up to 220
	image.backgroundColor = MagickColors.White;
	image.extent(400, 220, Gravity.North);

	image.strip();
	image.quality = 85;
	image.settings.setDefine('JPEG', 'sampling-factor', '2x2');
	image.settings.interlace = Interlace.Jpeg;

	return image.write('JPEG', Buffer.from);
}

function processWupHeader(image: IMagickImage): Buffer | null {
	if (image.width !== 1280 || image.height !== 180) {
		return null;
	}

	image.strip();
	image.quality = 85;
	image.settings.setDefine('JPEG', 'sampling-factor', '2x2');
	image.settings.interlace = Interlace.Jpeg;

	return image.write('JPEG', Buffer.from);
}

export type HeaderUrls = {
	ctr: string;
	wup: string;
};

export async function uploadHeaders(ctr_header: Buffer, wup_header: Buffer, communityID: string): Promise<HeaderUrls | null> {
	const ctr_processed = ImageMagick.read(ctr_header, 'PNG', processCtrHeader);
	const wup_processed = ImageMagick.read(wup_header, 'PNG', processWupHeader);
	if (ctr_processed === null || wup_processed == null) {
		return null;
	}

	const ctr = `/headers/${communityID}/3DS.jpg`;
	const wup = `/headers/${communityID}/WiiU.jpg`;

	if (!await uploadCDNAsset(ctr, ctr_processed, 'public-read') ||
		!await uploadCDNAsset(wup, wup_processed, 'public-read')) {
		return null;
	}

	return {
		ctr,
		wup
	};
}

async function loadMagick(): Promise<void> {
	const wasmPath = new URL(import.meta.resolve('@imagemagick/magick-wasm/magick.wasm'));
	const wasm = await readFile(wasmPath);
	await initializeImageMagick(wasm);
	logger.success('Started up ImageMagick engine');
}
await loadMagick();
