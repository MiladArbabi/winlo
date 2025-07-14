// packages/api/src/routes/products.ts
import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const rows = await db('products')
      .select(
        'products.id',
        'products.name',
        'shops.id as shop_id',
        'shops.name as shop_name',
        'products.aisle',
        'products.bin',
        'products.x',
        'products.y'
      )
      .join('shops', 'products.shop_id', 'shops.id');

    const products = rows.map((r: any) => ({
      id:       r.id,
      name:     r.name,
      shop:     { id: r.shop_id, name: r.shop_name },
      location: { aisle: r.aisle, bin: r.bin, x: r.x, y: r.y }
    }));

    res.json(products);
  } catch (err) {
    next(err);
  }
});

export default router;
