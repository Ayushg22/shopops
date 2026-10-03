import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
  headers: Record<string, any>;
}

export function requireAuth(req: any, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or malformed authorization header' },
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId: (req.headers['x-correlation-id'] as string) || ''
      }
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token not provided' },
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId: (req.headers['x-correlation-id'] as string) || ''
      }
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (_err) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token is expired or invalid' },
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId: (req.headers['x-correlation-id'] as string) || ''
      }
    });
    return;
  }
}
