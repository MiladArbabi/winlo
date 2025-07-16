// packages/api/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { httpLogger, logger } from './logger.js';
import productsRouter from './routes/products.js';
import routeRouter    from './routes/route.js';
import v1Router       from './routes/v1/index.js';

const app = express();

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

// 1) Log every incoming request
app.use(httpLogger);

// 2) parse JSON bodies
app.use(express.json());

// 3) versioned v1 routes
app.use('/v1', v1Router);

// 4) health-check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 5) global error handler (after all routes)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
