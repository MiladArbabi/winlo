// packages/api/src/index.ts
import express from 'express';
import productsRouter from './routes/products.ts';
import routeRouter    from './routes/route.ts';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use('/products', productsRouter);
app.use('/route',    routeRouter);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});