import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  serviceName: z.string().default('notification-service'),
  port: z.string().transform((v) => parseInt(v, 10)).default('8006'),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  logLevel: z.string().default('info'),
  rabbitmqUrl: z.string().default(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'),
  redisUrl: z.string().default(process.env.REDIS_URL || 'redis://localhost:6379')
});

export const config = configSchema.parse({
  serviceName: 'notification-service',
  port: process.env.PORT_NOTIFICATION_SERVICE || process.env.PORT || '8006',
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL,
  rabbitmqUrl: process.env.RABBITMQ_URL,
  redisUrl: process.env.REDIS_URL
});
