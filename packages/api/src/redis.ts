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

// Connect immediately (fire‑and‑forget)
if (process.env.NODE_ENV === 'production') {
    // only in prod do we log—dev machines can skip or run Redis separately
    redisClient.connect().catch(err => {
      logger.error({ err }, 'Redis client error');
    });
  } else {
    // dev/test: fire-and-forget, no spam
    redisClient.connect().catch(() => {});
  }