import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  serviceName: z.string().default('payment-service'),
  port: z.string().transform((v) => parseInt(v, 10)).default('8005'),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  logLevel: z.string().default('info'),
  databaseUrl: z.string().default(
    process.env.DATABASE_URL_PAYMENT || 'postgresql://shopops:shopops_dev_secret@localhost:5432/shopops_payment?schema=public'
  ),
  rabbitmqUrl: z.string().default(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672')
});

export const config = configSchema.parse({
  serviceName: 'payment-service',
  port: process.env.PORT_PAYMENT_SERVICE || process.env.PORT || '8005',
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL,
  databaseUrl: process.env.DATABASE_URL_PAYMENT || process.env.DATABASE_URL,
  rabbitmqUrl: process.env.RABBITMQ_URL
});
