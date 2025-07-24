// packages/api/src/middleware/auth.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  shopId: number;
  iat: number;
  exp: number;
}

// augment Request to carry shopId
export interface AuthenticatedRequest extends Request {
  shopId: number;
}

export const authenticateJWT: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
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
    const payload = jwt.verify(token, secret) as JwtPayload;
    // cast to our augmented type before setting shopId:
    (req as AuthenticatedRequest).shopId = payload.shopId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
