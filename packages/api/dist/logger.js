// packages/api/src/logger.ts
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pino = require('pino');
const pinoHttp = require('pino-http');
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: { colorize: true }
    }
});
export const httpLogger = pinoHttp({ logger });
