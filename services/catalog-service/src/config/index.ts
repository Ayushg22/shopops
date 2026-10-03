import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  serviceName: z.string().default('catalog-service'),
  port: z.string().transform((v) => parseInt(v, 10)).default('8002'),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  logLevel: z.string().default('info'),
  databaseUrl: z.string().default(
    process.env.DATABASE_URL_CATALOG || 'postgresql://shopops:shopops_dev_secret@localhost:5432/shopops_catalog?schema=public'
  )
});

export const config = configSchema.parse({
  serviceName: 'catalog-service',
  port: process.env.PORT_CATALOG_SERVICE || process.env.PORT || '8002',
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL,
  databaseUrl: process.env.DATABASE_URL_CATALOG || process.env.DATABASE_URL
});
