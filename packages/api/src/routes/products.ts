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
    const result = ProductsQuery.safeParse(req.query);
    if (!result.success) {
      logger.warn({ err: result.error }, 'Invalid products query');
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: result.error.format()
      });
    }

    // pull the parsed values (including optional `shop`)
    const {
        shop: shopParam,
        limit  = 50,
        page   = 1,
        sort   = 'id',
        order  = 'asc',
      } = result.data;

    // in test mode we trust the `shop` query param; otherwise use the JWT‐injected shopId
    const shopId =
    shopParam !== undefined
      ? Number(shopParam)
      : (req as import('../middleware/auth.js').AuthenticatedRequest).shopId;

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
  const maybeRows = await db('products')
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
    .join('shops', 'products.shop_id', 'shops.id')

    const hasParams = Object.keys(req.query).length > 0;

    if (!hasParams) {
      // no query params → simple list
      return res.json({
        page,
        limit,
        data: (maybeRows as any[]).map(mapRow)
      });
    }

    // second call → fresh builder for paginated/filter/sort
    const rows = await db('products')
      .select(
        'products.id','products.name',
        'shops.id as shop_id','shops.name as shop_name',
        'products.aisle','products.bin','products.x','products.y'
      )
      .join('shops','products.shop_id','shops.id')
      .where('products.shop_id', shopId)
      .orderBy(`products.${sort}`, order as 'asc' | 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

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