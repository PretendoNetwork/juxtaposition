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
