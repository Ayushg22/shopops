import { z, ZodSchema } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export interface BaseAppConfig {
  nodeEnv: string;
  port: number;
  serviceName: string;
  logLevel: string;
}

export function validateConfig<T>(schema: ZodSchema<T>, env: Record<string, unknown> = process.env): T {
  const result = schema.safeParse(env);
  if (!result.success) {
    console.error('Invalid environment configuration:', result.error.format());
    throw new Error('Environment configuration validation failed');
  }
  return result.data;
}

export const baseConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((v) => parseInt(v, 10)),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});
