import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  serviceName: z.string().default('auth-service'),
  port: z.string().transform((v) => parseInt(v, 10)).default('8001'),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  logLevel: z.string().default('info'),
  databaseUrl: z.string().default(
    process.env.DATABASE_URL_AUTH || 'postgresql://shopops:shopops_dev_secret@localhost:5432/shopops_auth?schema=public'
  ),
  jwtSecret: z.string().default('super_secret_jwt_key_for_local_development_only_change_in_prod'),
  jwtExpiresIn: z.string().default('1h')
});

export const config = configSchema.parse({
  serviceName: 'auth-service',
  port: process.env.PORT_AUTH_SERVICE || process.env.PORT || '8001',
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL,
  databaseUrl: process.env.DATABASE_URL_AUTH || process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN
});
