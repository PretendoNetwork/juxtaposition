import { z } from 'zod';

function cleanBase64String(str: string): string {
	return str.trim().replace(/[^A-Za-z0-9+/=\s]/g, ''); // Remove all non-base64 characters
}

/**
 * Titles that send base64 as a string do it a little inconsistently.
 * This utility cleans the base64 and handles all titles and parses it into a buffer.
 *
 * Known funky titles:
 * - Nintendo Land: Sends a 0x0 byte at the end of the string
 */
export function cleanedBase64(maxSize?: number): z.ZodType<Buffer> {
	return z
		.string()
		.transform(v => cleanBase64String(v))
		.transform(v => Buffer.from(v, 'base64'))
		.refine(v => (maxSize !== undefined ? v.length <= maxSize : true)); // Maybe there's a more specific error to give for maxsize?
}
