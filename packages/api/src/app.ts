// packages/api/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { httpLogger, logger } from './logger.js';
import v1Router       from './routes/v1/index.js';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { authenticateJWT } from './middleware/auth.js';
import authRouter from './routes/auth.js';

// === emulate __dirname in ESM ===
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const app = express();

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', uptime: process.uptime() })
);

// 0) Security headers
app.use(helmet());

// 0b) CORS – only allow origins in env.ALLOWED_ORIGINS (comma‑sep), fallback to none
const origins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({ origin: origins, optionsSuccessStatus: 200 }));

// 0c) Rate limiting – 100 requests per IP per 15 minutes
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ** serve OpenAPI UI **
const spec = YAML.load(resolve(__dirname, 'openapi.yaml'));
app.use('/docs', swaggerUI.serve, swaggerUI.setup(spec));

// 1) Log every incoming request
app.use(httpLogger);

// 2) parse JSON bodies
app.use(express.json());

// 3a) public auth endpoint under /v1/auth
console.log('[app] → mounting authRouter @ /v1/auth');
app.use('/v1/auth', authRouter);

// 3b) protect everything else under /v1 with JWT
app.use('/v1', authenticateJWT, v1Router);

// 4) health-check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 5) global error handler (after all routes)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack || err);
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
