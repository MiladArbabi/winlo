// packages/api/src/routes/route.ts
import { Router } from 'express';
import db from '../db.ts';

interface Product {
  id: number;
  name: string;
  shop: { id: number; name: string };
  location: { x: number; y: number; aisle: string; bin: string };
}

function euclidean(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const router = Router();

/**
 * POST /route
 * Body: { productIds: number[] }
 * Returns an optimized pick‐order + total distance.
 */
router.post('/', async (req, res, next) => {
  try {
    const ids: number[] = req.body.productIds;
    if (!Array.isArray(ids) || ids.some(id => typeof id !== 'number')) {
      return res.status(400).json({ error: 'productIds must be number[]' });
    }

    // fetch products + their shop & coords
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
      .whereIn('products.id', ids);

    const products: Product[] = rows.map(r => ({
      id: r.id,
      name: r.name,
      shop: { id: r.shop_id, name: r.shop_name },
      location: {
        aisle: r.aisle,
        bin: r.bin,
        x: r.x,
        y: r.y,
      },
    }));

    // Greedy nearest‐neighbor route from entrance (0,0)
    const route: Product[] = [];
    let current = { x: 0, y: 0 };
    let remaining = [...products];
    let totalDistance = 0;

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
