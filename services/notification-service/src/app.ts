import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { Logger, createHttpLoggingMiddleware } from '@shopops/logger';
import { startNotificationConsumer, redis, eventBus } from './events/notification.consumer';

const logger = new Logger(config.serviceName);
const app = express();

app.use(cors());
app.use(express.json());
app.use(createHttpLoggingMiddleware(logger));

// Fetch customer notifications
app.get('/api/v1/notifications/:id', async (req: Request, res: Response) => {
  const notifs = await redis.lrange(`notifications:${req.params.id}`, 0, 20);
  const parsed = notifs.map((n) => JSON.parse(n));
  res.json({ success: true, data: parsed });
});

// Probes
app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: config.serviceName });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    const ping = await redis.ping();
    res.status(200).json({ status: 'READY', service: config.serviceName, redis: ping });
  } catch (err: any) {
    res.status(503).json({ status: 'NOT_READY', service: config.serviceName, redis: 'DISCONNECTED' });
  }
});

app.get('/metrics', (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send('# HELP up Service up indicator\n# TYPE up gauge\nup 1\n');
});

const server = app.listen(config.port, async () => {
  logger.info(`Notification service listening on port ${config.port}`);
  try {
    await startNotificationConsumer();
  } catch (err) {
    logger.error('Failed to start Notification Consumer', err);
  }
});

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  redis.disconnect();
  await eventBus.disconnect();
  server.close(() => {
    logger.info('Closed HTTP server. Process exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
