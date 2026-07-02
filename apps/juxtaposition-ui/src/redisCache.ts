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

export async function redisSet(key: string, value: string, expireTime?: number): Promise<boolean> {
	if (!redisClient.isOpen) {
		return false;
	}

	await redisClient.set(key, value, {
		expiration: expireTime
			? {
					type: 'EX',
					value: expireTime
				}
			: undefined
	});
	return true;
}

export async function redisGet(key: string): Promise<string | null> {
	if (!redisClient.isOpen) {
		return null;
	}

	const result = await redisClient.get(key);
	return result;
}

export async function redisRemove(key: string): Promise<boolean> {
	if (!redisClient.isOpen) {
		return false;
	}

	await redisClient.del(key);
	return true;
}
