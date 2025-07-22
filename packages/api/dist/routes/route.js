var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import { z } from 'zod';
import db from '../db.js';
function euclidean(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}
export const RouteRequestSchema = z.object({
    productIds: z.array(z.number().int().positive()).nonempty(),
});
const router = Router();
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) validate
    const result = RouteRequestSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid payload', details: result.error.format() });
    }
    const { productIds } = result.data;
    try {
        // 2) fetch
        const rows = yield db('products')
            .select('products.id', 'products.name', 'shops.id as shop_id', 'shops.name as shop_name', 'products.aisle', 'products.bin', 'products.x', 'products.y')
            .join('shops', 'products.shop_id', 'shops.id')
            .whereIn('products.id', productIds);
        // 3) map to Product
        const products = rows.map(r => ({
            id: r.id,
            name: r.name,
            shop: { id: r.shop_id, name: r.shop_name },
            location: { aisle: r.aisle, bin: r.bin, x: r.x, y: r.y }
        }));
        // 4) greedy nearest-neighbor
        let current = { x: 0, y: 0 };
        const route = [];
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
    }
    catch (err) {
        next(err);
    }
}));
export default router;
