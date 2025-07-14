// packages/api/src/index.ts
import express from 'express';
import productsRouter from './routes/products.ts';    // ← note the “.ts” here

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/products', productsRouter);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});