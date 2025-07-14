// packages/api/src/app.ts
import express from 'express';
import productsRouter from './routes/products.js';
import routeRouter    from './routes/route.js';

const app = express();

// 👇 parse JSON bodies
app.use(express.json());

// 👇 mount our endpoints
app.use('/products', productsRouter);
app.use('/route',    routeRouter);

// 👇 health-check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;

// global error handler (must come *after* all routes)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('[app] unhandled error:', err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    });