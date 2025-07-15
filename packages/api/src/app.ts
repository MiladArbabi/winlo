// packages/api/src/app.ts
import express from 'express';
import { httpLogger, logger } from './logger.js';
import productsRouter from './routes/products.js';
import routeRouter    from './routes/route.js';

const app = express();

// 1) Log every incoming request
app.use(httpLogger);

// 2) parse JSON bodies
app.use(express.json());

// 3) mount endpoints
app.use('/products', productsRouter);
app.use('/route',    routeRouter);

// 4) health-check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 5) global error handler (after all routes)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
