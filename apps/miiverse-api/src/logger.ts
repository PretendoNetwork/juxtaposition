import fs from 'fs-extra';
import colors from 'colors';
import { config } from './config';

colors.enable();

fs.ensureDirSync(config.logFolder);

const streams = {
	latest: fs.createWriteStream(`${config.logFolder}/latest.log`),
	success: fs.createWriteStream(`${config.logFolder}/success.log`),
	error: fs.createWriteStream(`${config.logFolder}/error.log`),
	warn: fs.createWriteStream(`${config.logFolder}/warn.log`),
	info: fs.createWriteStream(`${config.logFolder}/info.log`)
} as const;

export function LOG_SUCCESS(input: string): void {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [SUCCESS]: ${input}`;
	streams.success.write(`${input}\n`);

	console.log(`${input}`.green.bold);
}

export function LOG_ERROR(input: string): void {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [ERROR]: ${input}`;
	streams.error.write(`${input}\n`);

	console.log(`${input}`.red.bold);
}

export function LOG_WARN(input: string): void {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [WARN]: ${input}`;
	streams.warn.write(`${input}\n`);

	console.log(`${input}`.yellow.bold);
}

export function LOG_INFO(input: string): void {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [INFO]: ${input}`;
	streams.info.write(`${input}\n`);

	console.log(`${input}`.cyan.bold);
}
