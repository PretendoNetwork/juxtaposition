import mongoose from 'mongoose';
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

export const database = {
	connect
};
