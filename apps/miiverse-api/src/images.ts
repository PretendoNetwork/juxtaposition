import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { ColorType, FilterType, Gravity, ImageMagick, initializeImageMagick, Interlace, MagickColors, Orientation } from '@imagemagick/magick-wasm';
import { deflate, inflate } from 'pako';
import { logger } from '@/logger';
import { uploadCDNAsset } from '@/util';
import type { IMagickImage } from '@imagemagick/magick-wasm';

export type Painting = {
	png: Buffer;
	big: Buffer;
	tgaz: Buffer;
};

function processPainting(image: IMagickImage): Painting {
	image.crop(320, 120);
	image.extent(320, 120);
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
		big: image.clone((image) => {
			image.filterType = FilterType.Point;
			image.resize(640, 240);

			return image.write('PNG', Buffer.from);
		}),
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
export function processBmpPainting(painting: Buffer): Painting {
	return ImageMagick.read(painting, 'BMP', processPainting);
}
/**
 * Processes, sanitises and converts TGAZ-format paintings.
 * @param painting Buffer of TGAZ painting.
 * @returns PNG and TGAZ-encoded paintings.
 */
export function processTgazPainting(painting: Buffer): Painting {
	const tga = inflate(painting);
	return ImageMagick.read(tga, 'TGA', processPainting);
}
/**
 * Autodetects a BMPZ or TGAZ painting based on the file header and processes it accordingly.
 * This is used in the api, where 3DS uses BMPZ and Wii U uses TGAZ.
 * @param painting Buffer of BMPZ or TGAZ painting.
 * @returns PNG and TGAZ-encoded paintings.
 */
function processAutozPainting(painting: Buffer): Painting {
	const data = inflate(painting);
	// todo this sucks
	if (data.length > 0 && data[0] == 66 /* 'B' */) {
		return ImageMagick.read(data, 'BMP', processPainting);
	} else {
		return ImageMagick.read(data, 'TGA', processPainting);
	}
}

export type ProcessPaintingOptions = {
	blob: string;
	isBmp: boolean;
	autodetectFormat: boolean;
	pid: number;
	postId: string;
};
export type PaintingUrls = {
	blob: string;
	img: string;
	big: string;
};
/**
 * Processes and uploads a new painting to the CDN - to paintings/${pid}/${postID}.png.
 * @param paintingBlob base64 TGAZ or BMP blob from the client request body.
 * @param bmp 'true' if the image should be decoded as BMP (as on 3DS).
 * @param pid Poster PID.
 * @param postID Post ID.
 * @returns base64 TGAZ blob, sanitised.
 */
export async function uploadPainting(opts: ProcessPaintingOptions): Promise<PaintingUrls | null> {
	const paintingBuf = Buffer.from(opts.blob.replace(/\0/g, '').trim(), 'base64');
	const paintings = ((): Painting => {
		if (opts.autodetectFormat) {
			return processAutozPainting(paintingBuf);
		} else if (opts.isBmp) {
			return processBmpPainting(paintingBuf);
		} else {
			return processTgazPainting(paintingBuf);
		}
	})();

	const imgKey = `paintings/${opts.pid}/${opts.postId}.png`;
	const bigKey = `paintings/${opts.pid}/${opts.postId}-big.png`;

	if (!await uploadCDNAsset(imgKey, paintings.png, 'public-read')) {
		return null;
	}

	if (!await uploadCDNAsset(bigKey, paintings.big, 'public-read')) {
		return null;
	}

	return {
		blob: paintings.tgaz.toString('base64'),
		img: `/${imgKey}`,
		big: `/${bigKey}`
	};
}

export type Aspect = '16:9' | '5:3' | '4:3';

export type Screenshot = {
	// Normal image
	jpg: Buffer;
	// Tiny image (for ctr)
	thumb: Buffer;
	// 2x image (for wiiu)
	big: Buffer | null;

	aspect: Aspect;
};

type Res = {
	w: number;
	h: number;
};
function res(w: number, h: number): Res {
	return { w, h };
}

type ScreenshotRes = {
	full: Res;
	thumb: Res;
	big: Res | null;

	aspect: Aspect;
};

const validResolutions: ScreenshotRes[] = [
	{ full: res(800, 450), thumb: res(320, 180), big: null, aspect: '16:9' },
	{ full: res(400, 240), thumb: res(320, 192), big: res(800, 480), aspect: '5:3' },
	{ full: res(320, 240), thumb: res(320, 240), big: res(640, 480), aspect: '4:3' },
	{ full: res(640, 480), thumb: res(320, 240), big: null, aspect: '4:3' }
];

function processScreenshot(image: IMagickImage): Screenshot | null {
	const res = validResolutions.find(({ full }) => full.w === image.width && full.h === image.height);
	if (res === undefined) {
		return null;
	}
	const { thumb, big, aspect } = res;
	// Remove EXIF whatever
	image.strip();

	image.quality = 90;
	image.settings.setDefine('JPEG', 'sampling-factor', '2x2');
	image.settings.interlace = Interlace.Jpeg;

	return {
		jpg: image.write('JPEG', Buffer.from),
		thumb: image.clone((image) => {
			image.filterType = FilterType.Lanczos2;
			image.resize(thumb.w, thumb.h);
			image.extent(thumb.w, thumb.h, Gravity.Center);

			image.quality = 80; // smash 'em
			return image.write('JPEG', Buffer.from);
		}),
		big: image.clone((image) => {
			if (!big) {
				return null;
			}

			// the entire purpose of doing this is to get sharp pixels
			image.filterType = FilterType.Point;
			image.resize(big.w, big.h);
			image.extent(big.w, big.h, Gravity.Center);

			return image.write('JPEG', Buffer.from);
		}),
		aspect
	};
}

export function processJpgScreenshot(painting: Buffer): Screenshot | null {
	return ImageMagick.read(painting, 'JPG', processScreenshot);
}

export type ScreenshotUrls = {
	full: string;
	fullLength: number;
	thumb: string;
	big: string | null;
	aspect: Aspect;
};

export type UploadScreenshotOptions = {
	blob: string;
	pid: number;
	postId: string;
};
export async function uploadScreenshot(opts: UploadScreenshotOptions): Promise<ScreenshotUrls | null> {
	const screenshotBuf = Buffer.from(opts.blob.replace(/\0/g, '').trim(), 'base64');
	const screenshots = processJpgScreenshot(screenshotBuf);
	if (screenshots === null) {
		return null;
	}

	const fullKey = `screenshots/${opts.pid}/${opts.postId}.jpg`;
	const thumbKey = `screenshots/${opts.pid}/${opts.postId}-thumb.jpg`;
	const bigKey = `screenshots/${opts.pid}/${opts.postId}-big.jpg`;

	const fullLength = screenshots.jpg.byteLength;

	if (!await uploadCDNAsset(fullKey, screenshots.jpg, 'public-read')) {
		return null;
	}

	if (!await uploadCDNAsset(thumbKey, screenshots.thumb, 'public-read')) {
		return null;
	}

	if (screenshots.big && !await uploadCDNAsset(bigKey, screenshots.big, 'public-read')) {
		return null;
	}

	const full = `/${fullKey}`;
	const thumb = `/${thumbKey}`;
	const big = screenshots.big ? `/${bigKey}` : null;

	return { full, fullLength, thumb, big, aspect: screenshots.aspect };
}

type Icon = {
	icon32: Buffer;
	icon48: Buffer;
	icon64: Buffer;
	icon96: Buffer;
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
		icon48: image.clone((image) => {
			image.resize(48, 48);
			return image.write('PNG', Buffer.from);
		}),
		icon64: image.clone((image) => {
			image.resize(64, 64);
			return image.write('PNG', Buffer.from);
		}),
		icon96: image.clone((image) => {
			image.resize(96, 96);
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
	icon48: string;
	icon64: string;
	icon96: string;
	icon128: string;
	tgaBlob: string;
};
export type UploadIconsOptions = {
	icon: Buffer;
	communityId: string;
};

export async function uploadIcons(opts: UploadIconsOptions): Promise<IconUrls | null> {
	const icons = ImageMagick.read(opts.icon, 'PNG', processIcon);
	if (icons === null) {
		return null;
	}

	const icon32Key = `icons/${opts.communityId}/32.png`;
	const icon48Key = `icons/${opts.communityId}/48.png`;
	const icon64Key = `icons/${opts.communityId}/64.png`;
	const icon96Key = `icons/${opts.communityId}/96.png`;
	const icon128Key = `icons/${opts.communityId}/128.png`;

	if (!await uploadCDNAsset(icon32Key, icons.icon32, 'public-read') ||
		!await uploadCDNAsset(icon48Key, icons.icon48, 'public-read') ||
		!await uploadCDNAsset(icon64Key, icons.icon64, 'public-read') ||
		!await uploadCDNAsset(icon96Key, icons.icon96, 'public-read') ||
		!await uploadCDNAsset(icon128Key, icons.icon128, 'public-read')) {
		return null;
	}

	const icon32 = `/${icon32Key}`;
	const icon48 = `/${icon48Key}`;
	const icon64 = `/${icon64Key}`;
	const icon96 = `/${icon96Key}`;
	const icon128 = `/${icon128Key}`;

	return {
		icon32,
		icon48,
		icon64,
		icon96,
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
	image.quality = 90;
	image.settings.setDefine('JPEG', 'sampling-factor', '2x2');
	image.settings.interlace = Interlace.Jpeg;

	return image.write('JPEG', Buffer.from);
}

function processWupHeader(image: IMagickImage): Buffer | null {
	if (image.width !== 1280 || image.height !== 180) {
		return null;
	}

	image.strip();
	image.quality = 90;
	image.settings.setDefine('JPEG', 'sampling-factor', '2x2');
	image.settings.interlace = Interlace.Jpeg;

	return image.write('JPEG', Buffer.from);
}

export type HeaderUrls = {
	ctr: string;
	wup: string;
};
export type UploadHeadersOptions = {
	ctr_header: Buffer;
	wup_header: Buffer;
	communityId: string;
};

export async function uploadHeaders(opts: UploadHeadersOptions): Promise<HeaderUrls | null> {
	const ctr_processed = ImageMagick.read(opts.ctr_header, 'PNG', processCtrHeader);
	const wup_processed = ImageMagick.read(opts.wup_header, 'PNG', processWupHeader);
	if (ctr_processed === null || wup_processed == null) {
		return null;
	}

	const ctrKey = `headers/${opts.communityId}/3DS.jpg`;
	const wupKey = `headers/${opts.communityId}/WiiU.jpg`;

	if (!await uploadCDNAsset(ctrKey, ctr_processed, 'public-read') ||
		!await uploadCDNAsset(wupKey, wup_processed, 'public-read')) {
		return null;
	}

	const ctr = `/${ctrKey}`;
	const wup = `/${wupKey}`;

	return {
		ctr,
		wup
	};
}

export async function initImageProcessing(): Promise<void> {
	const wasmPath = new URL(import.meta.resolve('@imagemagick/magick-wasm/magick.wasm'));
	const wasm = await readFile(wasmPath);
	await initializeImageMagick(wasm);
	logger.success('Started up image processing engine');
}
