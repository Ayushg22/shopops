import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  serviceName: z.string().default('api-gateway'),
  port: z.string().transform((v) => parseInt(v, 10)).default('8000'),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  logLevel: z.string().default('info'),
  authServiceUrl: z.string().default('http://localhost:8001'),
  catalogServiceUrl: z.string().default('http://localhost:8002'),
  orderServiceUrl: z.string().default('http://localhost:8003'),
  inventoryServiceUrl: z.string().default('http://localhost:8004'),
  paymentServiceUrl: z.string().default('http://localhost:8005'),
  notificationServiceUrl: z.string().default('http://localhost:8006')
});

export const config = configSchema.parse({
  serviceName: 'api-gateway',
  port: process.env.PORT_API_GATEWAY || process.env.PORT || '8000',
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL,
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
  catalogServiceUrl: process.env.CATALOG_SERVICE_URL || 'http://localhost:8002',
  orderServiceUrl: process.env.ORDER_SERVICE_URL || 'http://localhost:8003',
  inventoryServiceUrl: process.env.INVENTORY_SERVICE_URL || 'http://localhost:8004',
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || 'http://localhost:8005',
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8006'
});
