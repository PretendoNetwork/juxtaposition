import redis from 'redis';
import { logger } from '@/logger';
import { config } from '@/config';
const { host, port } = config.redis;

export const redisClient = redis.createClient({
	url: `redis://${host}:${port}`
});

redisClient.on('error', (error) => {
	logger.error(error);
});

redisClient.on('connect', () => {
	logger.success('Redis connected');
});

export async function setValue(key, value, expireTime) {
	if (!redisClient.isOpen) {
		return false;
	}

	await redisClient.set(key, value, 'EX', expireTime);
	// Seems to be a library bug, so we have to manually set the expire time
	await redisClient.expire(key, expireTime);
	return true;
}

export async function getValue(key) {
	if (!redisClient.isOpen) {
		return false;
	}

	const result = await redisClient.get(key);
	return result;
}

export async function removeValue(key) {
	if (!redisClient.isOpen) {
		return false;
	}

	await redisClient.del(key);
	return true;
}
