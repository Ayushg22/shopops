import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);

      return res.status(201).json({
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: (req.headers['x-correlation-id'] as string) || ''
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || (error.name === 'ZodError' ? 400 : 500);
      return res.status(statusCode).json({
        success: false,
        error: {
          code: error.name === 'ZodError' ? 'VALIDATION_ERROR' : 'REGISTRATION_FAILED',
          message: error.message,
          details: error.errors || undefined
        },
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: (req.headers['x-correlation-id'] as string) || ''
        }
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);

      return res.status(200).json({
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: (req.headers['x-correlation-id'] as string) || ''
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || (error.name === 'ZodError' ? 400 : 500);
      return res.status(statusCode).json({
        success: false,
        error: {
          code: error.name === 'ZodError' ? 'VALIDATION_ERROR' : 'AUTHENTICATION_FAILED',
          message: error.message,
          details: error.errors || undefined
        },
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: (req.headers['x-correlation-id'] as string) || ''
        }
      });
    }
  }

  async me(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No user session' } });
      }

      const profile = await authService.getProfile(userId);
      return res.status(200).json({
        success: true,
        data: profile,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: (req.headers['x-correlation-id'] as string) || ''
        }
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: 'USER_LOOKUP_FAILED', message: error.message }
      });
    }
  }
}

export const authController = new AuthController();
