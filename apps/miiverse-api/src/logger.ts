import { pino } from 'pino';
import pinoPretty from 'pino-pretty';
import { config } from '@/config';
import type { SerializedRequest, SerializedResponse } from 'pino';
import type { Color } from 'colorette';

const pretty = config.log.format == 'pretty'
	? pinoPretty({
			customPrettifiers: {
				// Clean up Express types for developer eyes
				req(inputData, _key, _log, { colors }) {
					const req = inputData as SerializedRequest;
					return `${colors.bold(req.method)} ${req.headers.host}${req.url} (${req.remoteAddress}:${req.remotePort})`;
				},
				res(inputData, _key, _log, { colors }) {
					const res = inputData as SerializedResponse;
					const color = ((): Color => {
						if (res.statusCode >= 500) {
							return colors.red;
						} else if (res.statusCode >= 400) {
							return colors.yellow;
						} else if (res.statusCode >= 200) {
							return colors.green;
						} else {
							return colors.reset;
						}
					})();

					return `${color(res.statusCode)} (${res.headers['content-length']} bytes)`;
				}
			}
		})
	: undefined;

// Main logger object
export const logger = pino({
	level: config.log.level,

	customLevels: {
		success: 35 // between INFO and WARN
	}
}, pretty);

// Compatibility for old logging API

/**
 * @deprecated Old logging api - Please import { logger } and use logger.success!
 */
export function LOG_SUCCESS(input: string): void {
	logger.success(input);
}

/**
 * @deprecated Old logging api - Please import { logger } and use logger.error!
 */
export function LOG_ERROR(input: string): void {
	logger.error(input);
}

/**
 * @deprecated Old logging api - Please import { logger } and use logger.warn!
 */
export function LOG_WARN(input: string): void {
	logger.warn(input);
}

/**
 * @deprecated Old logging api - Please import { logger } and use logger.info!
 */
export function LOG_INFO(input: string): void {
	logger.info(input);
}
