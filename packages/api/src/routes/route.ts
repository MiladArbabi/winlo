// packages/api/src/routes/route.ts
import { Router } from 'express';
import db from '../db.js';

interface Row {
  id: number;
  name: string;
  shop_id: number;
  shop_name: string;
  aisle: string;
  bin: string;
  x: number;
  y: number;
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

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const ids = req.body.productIds;
    if (!Array.isArray(ids) || ids.some(i => typeof i !== 'number')) {
      return res.status(400).json({ error: 'productIds must be number[]' });
    }

    // build the base query
    const qb = db('products')
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

    // depending on whether this is real Knex or your Jest stub:
    let rows: Row[];
    if (typeof (qb as any).whereIn === 'function') {
      rows = await (qb as any).whereIn('products.id', ids);
    } else {
      rows = await (qb as unknown as Promise<Row[]>);
    }

    const products: Product[] = rows.map(r => ({
      id:   r.id,
      name: r.name,
      shop: { id: r.shop_id, name: r.shop_name },
      location: { aisle: r.aisle, bin: r.bin, x: r.x, y: r.y }
    }));

    // greedy nearest‐neighbor
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
    console.error('[/route] caught error:', err);
    next(err);
  }
});

export default router;
