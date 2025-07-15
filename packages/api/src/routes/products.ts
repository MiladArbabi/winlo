// packages/api/src/routes/products.ts
import { Router } from 'express';
import { z } from 'zod';
import db from '../db.js';
import { logger } from '../logger.js';
import { redisClient } from '../redis.js';

const ProductsQuery = z.object({
  shop:   z.string().regex(/^\d+$/).optional(),
  limit:  z.string().regex(/^\d+$/).transform(Number).optional(),
  page:   z.string().regex(/^\d+$/).transform(Number).optional(),
  sort:   z.string().optional(),             // e.g. "x" or "y"
  order:  z.enum(['asc', 'desc']).optional(),
});

function mapRow(r: any) {
  return {
    id: r.id,
    name: r.name,
    shop: { id: r.shop_id, name: r.shop_name },
    location: { aisle: r.aisle, bin: r.bin, x: r.x, y: r.y }
  };
}


const router = Router();

router.get('/', async (req, res, next) => {
  // 1) Validate & parse query params
  const result = ProductsQuery.safeParse(req.query);
  if (!result.success) {
    logger.warn({ err: result.error }, 'Invalid products query');
    return res.status(400).json({ error: 'Invalid query parameters', details: result.error.format() });
  }
  const { shop, limit = 50, page = 1, sort = 'id', order = 'asc' } = result.data;

  try {
  // build cache key once (we’ll only use it outside test env)
  const cacheKey = `products:${JSON.stringify(req.query)}`;
  // --- CACHING LAYER (skip in tests) ---
  if (process.env.NODE_ENV !== 'test') {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info({ cacheKey }, 'cache hit');
      return res.json(JSON.parse(cached));
    }
  }  

    // 3) Cache miss: run full logic    
    const base = db('products')
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

      const maybeRows = await base;
      const hasParams = Object.keys(req.query).length > 0;

          if (!hasParams) {
            // no query params → simple list stub
            const rows = (await base) as any[];
            return res.json({ page, limit, data: rows.map(mapRow) });
          }

          if (!hasParams && Array.isArray(maybeRows)) {
            const payload = { page, limit, data: maybeRows.map(mapRow) };
            if (process.env.NODE_ENV !== 'test') {
              await redisClient.set(cacheKey, JSON.stringify(payload), { EX: 60 });
            }
            return res.json(payload);
          }
      
          // with params → rebuild a fresh QueryBuilder
          let qb = db('products')
            .select(
              'products.id','products.name',
              'shops.id as shop_id','shops.name as shop_name',
              'products.aisle','products.bin','products.x','products.y'
            )
            .join('shops','products.shop_id','shops.id');

    if (shop) qb = qb.where('products.shop_id', Number(shop));
    qb = qb
      .orderBy(`products.${sort}`, order as 'asc' | 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    const rows = await qb;
    const payload = { page, limit, data: (rows as any[]).map(mapRow) };
    // cache the paginated result
    if (process.env.NODE_ENV !== 'test') {
      await redisClient.set(cacheKey, JSON.stringify(payload), { EX: 60 });
    }    
    return res.json(payload);
    } catch (err) {
    next(err);
  }
});

export default router;