import jwt from 'jsonwebtoken';
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
        return res.status(401).json({
            error: 'Missing or invalid Authorization header'
        });
    }
    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET must be set');
    }
    try {
        const payload = jwt.verify(token, secret);
        // cast to our augmented type before setting shopId:
        req.shopId = payload.shopId;
        next();
    }
    catch (_a) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
