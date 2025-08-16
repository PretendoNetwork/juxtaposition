import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
// @ts-expect-error Missing upstream types for this library
import TGA from 'tga';
// @ts-expect-error Missing upstream types for this library
import imagePixels from 'image-pixels';
import { inflate, deflate } from 'pako';
import sharp from 'sharp';
import { ColorType, ImageMagick, initializeImageMagick } from '@imagemagick/magick-wasm';
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
		tgaz: image.write('TGA', (tga) => {
			const tgaz = deflate(tga, { level: 6 });
			return Buffer.from(tgaz);
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

async function loadMagick(): Promise<void> {
	const wasmPath = new URL(import.meta.resolve('@imagemagick/magick-wasm/magick.wasm'));
	const wasm = await readFile(wasmPath);
	await initializeImageMagick(wasm);
	logger.success('Started up ImageMagick engine');
}
await loadMagick();

/**
 * Rezise an image.
 * @param data base64-encoded input image, most codecs OK (check Sharp docs)
 * @param width Target width in pixels
 * @param height Target height in pixels
 * @returns New image, same codec as the input (not base64'd!)
 */
export async function resizeImage(data: string, width: number, height: number): Promise<Buffer> {
	const image = Buffer.from(data, 'base64');
	return sharp(image)
		.resize({ height, width })
		.toBuffer()
		.catch((err) => {
			logger.error(err, 'Could not resize image!');
			throw err;
		});
}

export async function getTGAFromPNG(image: Buffer): Promise<string | null> {
	const pngData = await imagePixels(Buffer.from(image));
	const tga = TGA.createTgaBuffer(pngData.width, pngData.height, pngData.data);
	let output: Uint8Array;
	try {
		output = deflate(tga, { level: 6 });
	} catch (err) {
		logger.error(err, 'Could not decompress image');
		return null;
	}
	return Buffer.from(output.buffer).toString('base64').trim();
}
