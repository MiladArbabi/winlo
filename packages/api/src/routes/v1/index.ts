// packages/api/src/routes/v1/index.ts
import { Router } from 'express';
import productsRouter from '../products.js';
import routeRouter    from '../route.js';

const router = Router();

// all v1 routes are prefixed with /v1 in app.ts
router.use('/products', productsRouter);
router.use('/route',    routeRouter);

export default router;