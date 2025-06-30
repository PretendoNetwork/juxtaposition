import { Buffer } from 'node:buffer';
// @ts-expect-error Missing upstream types for this library
import TGA from 'tga';
// @ts-expect-error Missing upstream types for this library
import imagePixels from 'image-pixels';
import { inflate, deflate } from 'pako';
import { PNG } from 'pngjs';
import bmp from 'bmp-js';
import sharp from 'sharp';
import { logger } from '@/logger';

/** Ingests a BMP-format painting and converts it to the usual TGA format.
 * @param painting base64-encoded bmp image
 * @returns base64-encoded zlib-compressed TGA
 */
export async function processBmpPainting(painting: string): Promise<string | null> {
	const paintingBuffer = Buffer.from(painting, 'base64');
	const bitmap = bmp.decode(paintingBuffer);
	const tga = createTgaFromPixelData(bitmap.width, bitmap.height, bitmap.data, false);

	let output: Uint8Array;
	try {
		output = deflate(tga, { level: 6 });
	} catch (err) {
		logger.error(err, 'Could not compress painting');
		return null;
	}
	return Buffer.from(output.buffer).toString('base64');
}

/**
 * Ingests a raw painting and converts it for CDN upload.
 * @param painting base64-encoded zlib-compressed TGA
 * @returns PNG in buffer
 */
export async function processPainting(painting: string): Promise<Buffer | null> {
	const paintingBuffer = Buffer.from(painting, 'base64');
	let output: Uint8Array;
	try {
		output = inflate(paintingBuffer);
	} catch (err) {
		logger.error(err, 'Could not decompress painting');
		return null;
	}
	let tga: TGA;
	try {
		tga = new TGA(Buffer.from(output.buffer));
	} catch (e) {
		logger.error(e, 'Could not parse painting');
		return null;
	}
	const png = new PNG({
		width: tga.width,
		height: tga.height
	});
	png.data = tga.pixels;
	return PNG.sync.write(png);
}

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

/**
 * Makes a new TGA from BGRX pixel data
 * @param width Width of the data
 * @param height Height of the data
 * @param pixels [B1, G1, R1, X1, B2, R2, G2, X2...]
 * @param dontFlipY Invert the y-axis
 * @returns Buffer with TGA data
 *
 * Modified from https://github.com/steel1990/tga/blob/dcd2bff6536c1c75719ed4309389cd66f991d8d3/src/index.js#L16-L45
 */
function createTgaFromPixelData(width: number, height: number, pixels: Buffer, dontFlipY: boolean): Buffer {
	const buffer = Buffer.alloc(18 + pixels.length);
	// write header
	buffer.writeInt8(0, 0);
	buffer.writeInt8(0, 1);
	buffer.writeInt8(2, 2);
	buffer.writeInt16LE(0, 3);
	buffer.writeInt16LE(0, 5);
	buffer.writeInt8(0, 7);
	buffer.writeInt16LE(0, 8);
	buffer.writeInt16LE(0, 10);
	buffer.writeInt16LE(width, 12);
	buffer.writeInt16LE(height, 14);
	buffer.writeInt8(32, 16);
	buffer.writeInt8(8, 17);

	let offset = 18;
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			const idx = ((dontFlipY ? i : height - i - 1) * width + j) * 4;
			buffer.writeUInt8(pixels[idx + 1], offset++); // b
			buffer.writeUInt8(pixels[idx + 2], offset++); // g
			buffer.writeUInt8(pixels[idx + 3], offset++); // r
			buffer.writeUInt8(255, offset++); // a
		}
	}

	return buffer;
}
