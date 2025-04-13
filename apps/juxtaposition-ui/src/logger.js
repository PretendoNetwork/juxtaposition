const fs = require('fs-extra');
const { config } = require('./config');
require('colors');

fs.ensureDirSync(config.logFolder);

const streams = {
	latest: fs.createWriteStream(`${config.logFolder}/latest.log`),
	success: fs.createWriteStream(`${config.logFolder}/success.log`),
	error: fs.createWriteStream(`${config.logFolder}/error.log`),
	warn: fs.createWriteStream(`${config.logFolder}/warn.log`),
	info: fs.createWriteStream(`${config.logFolder}/info.log`),
	audit: fs.createWriteStream(`${config.logFolder}/audit.log`)
};

function success(input) {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [SUCCESS]: ${input}`;
	streams.success.write(`${input}\n`);

	console.log(`${input}`.green.bold);
}

function error(input) {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [ERROR]: ${input}`;
	streams.error.write(`${input}\n`);

	console.log(`${input}`.red.bold);
}

function warn(input) {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [WARN]: ${input}`;
	streams.warn.write(`${input}\n`);

	console.log(`${input}`.yellow.bold);
}

function info(input) {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [INFO]: ${input}`;
	streams.info.write(`${input}\n`);

	console.log(`${input}`.cyan.bold);
}

function audit(input) {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [Audit]: ${input}`;
	streams.audit.write(`${input}\n`);

	console.log(`${input}`.white.bold);
}

module.exports = {
	success,
	error,
	warn,
	info,
	audit
};
