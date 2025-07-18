// packages/api/src/logger.ts
import pino from 'pino';
import pinoHttp from 'pino-http';
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: { colorize: true }
    }
});
export const httpLogger = pinoHttp({ logger });
