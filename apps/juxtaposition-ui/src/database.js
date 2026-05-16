import mongoose from 'mongoose';
import { CONTENT } from '@/models/content';
import { SETTINGS } from '@/models/settings';
import { logger } from '@/logger';
import { config } from '@/config';

let connection;
mongoose.set('strictQuery', true);

async function connect() {
	connection = mongoose.connection;
	connection.on('connected', function () {
		logger.info(`MongoDB connected ${this.name}`);
	});
	connection.on('error', err => logger.error(err, 'Database connection error'));
	connection.on('close', () => {
		connection.removeAllListeners();
	});

	await mongoose.connect(config.mongoose.uri);
}

function verifyConnected() {
	if (!connection) {
		connect();
	}
}

async function getUserSettings(pid) {
	verifyConnected();
	return SETTINGS.findOne({ pid: pid });
}

async function getUserContent(pid) {
	verifyConnected();
	return CONTENT.findOne({ pid: pid });
}

export const database = {
	connect,
	getUserSettings,
	getUserContent
};
