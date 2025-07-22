// packages/api/src/redis.ts
import { createClient } from 'redis';
import { logger } from './logger.js';
// adjust URL/opts via env if needed
export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.on('error', err => {
    logger.error({ err }, 'Redis client error');
});
// Only wire up Redis outside of test
if (process.env.NODE_ENV !== 'test') {
    redisClient.connect().catch(err => {
        logger.error({ err }, 'Failed to connect to Redis');
    });
}
