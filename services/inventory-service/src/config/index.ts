import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  serviceName: z.string().default('inventory-service'),
  port: z.string().transform((v) => parseInt(v, 10)).default('8004'),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  logLevel: z.string().default('info'),
  databaseUrl: z.string().default(
    process.env.DATABASE_URL_INVENTORY || 'postgresql://shopops:shopops_dev_secret@localhost:5432/shopops_inventory?schema=public'
  ),
  rabbitmqUrl: z.string().default(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672')
});

export const config = configSchema.parse({
  serviceName: 'inventory-service',
  port: process.env.PORT_INVENTORY_SERVICE || process.env.PORT || '8004',
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL,
  databaseUrl: process.env.DATABASE_URL_INVENTORY || process.env.DATABASE_URL,
  rabbitmqUrl: process.env.RABBITMQ_URL
});
