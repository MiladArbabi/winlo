var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// packages/api/src/routes/auth.ts
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../db.js';
const router = Router();
const LoginSchema = z.object({
    shopId: z.number().int().positive(),
    secret: z.string().min(1),
});
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = LoginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid login payload', details: result.error.format() });
    }
    const { shopId, secret } = result.data;
    try {
        // assumes you’ve added a `secret` column to `shops`
        const shop = yield db('shops').where({ id: shopId }).first();
        console.log({ shop, incoming: { shopId, secret } });
        if (!shop || shop.secret !== secret) {
            return res.status(401).json({ error: 'Invalid shopId or secret' });
        }
        const jwtSecret = process.env.JWT_SECRET;
        const expiresInValue = process.env.JWT_EXPIRES_IN || '1h';
        // cast into SignOptions so TS stops complaining
        const options = { expiresIn: expiresInValue };
        const token = jwt.sign({ shopId }, jwtSecret, options);
        return res.json({ token, expiresIn: options.expiresIn });
    }
    catch (err) {
        next(err);
    }
}));
export default router;
