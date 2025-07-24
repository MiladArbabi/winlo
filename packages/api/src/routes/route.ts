// packages/api/src/routes/route.ts
import { Router } from 'express';
import { z } from 'zod';
import db from '../db.js';

interface Row {
  id:       number;
  name:     string;
  shop_id:  number;
  shop_name:string;
  aisle:    string;
  bin:      string;
  x:        number;
  y:        number;
}

type Product = {
  id: number;
  name: string;
  shop: { id: number; name: string };
  location: { aisle: string; bin: string; x: number; y: number };
};

function euclidean(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export const RouteRequestSchema = z.object({
  productIds: z.array(z.number().int().positive()).nonempty(),
});

const router = Router();

router.post('/', async (req, res, next) => {
  // 1) validate
  const result = RouteRequestSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid payload', details: result.error.format() });
  }
  const { productIds } = result.data;

  try {
    // 2) fetch
    const shopId = (req as import('../middleware/auth.js').AuthenticatedRequest).shopId;
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
      .join('shops', 'products.shop_id', 'shops.id')
      .where('products.shop_id', shopId)
      .whereIn('products.id', productIds) as Row[];

    // 3) map to Product
    const products: Product[] = rows.map(r => ({
      id:   r.id,
      name: r.name,
      shop: { id: r.shop_id, name: r.shop_name },
      location: { aisle: r.aisle, bin: r.bin, x: r.x, y: r.y }
    }));

    // 4) greedy nearest-neighbor
    let current = { x: 0, y: 0 };
    const route: Product[] = [];
    let totalDistance = 0;
    const remaining = [...products];

    while (remaining.length) {
      let bestIdx = 0;
      let bestDist = euclidean(current, remaining[0].location);
      for (let i = 1; i < remaining.length; i++) {
        const d = euclidean(current, remaining[i].location);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      const next = remaining.splice(bestIdx, 1)[0];
      totalDistance += bestDist;
      route.push(next);
      current = next.location;
    }

    res.json({ route, totalDistance });
  } catch (err) {
    next(err);
  }
});

export default router;
