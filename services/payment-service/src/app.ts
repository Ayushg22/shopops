import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { Logger, createHttpLoggingMiddleware } from '@shopops/logger';
import { paymentRepository } from './repositories/payment.repository';
import { startPaymentConsumer, eventBus } from './events/payment.consumer';

const logger = new Logger(config.serviceName);
const app = express();

app.use(cors());
app.use(express.json());
app.use(createHttpLoggingMiddleware(logger));

app.get('/api/v1/payments/:orderId', async (req: Request, res: Response) => {
  const payment = await paymentRepository.findByOrderId(req.params.orderId as string);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'Payment not found' });
  }
  return res.json({ success: true, data: payment });
});

// Probes
app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: config.serviceName });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  const dbHealthy = await paymentRepository.checkHealth();
  if (dbHealthy) {
    res.status(200).json({ status: 'READY', service: config.serviceName, database: 'CONNECTED' });
  } else {
    res.status(503).json({ status: 'NOT_READY', service: config.serviceName, database: 'DISCONNECTED' });
  }
});

app.get('/metrics', (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send('# HELP up Service up indicator\n# TYPE up gauge\nup 1\n');
});

const server = app.listen(config.port, async () => {
  logger.info(`Payment service listening on port ${config.port}`);
  try {
    await startPaymentConsumer();
  } catch (err) {
    logger.error('Failed to start Payment Consumer', err);
  }
});

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await paymentRepository.disconnect();
  await eventBus.disconnect();
  server.close(() => {
    logger.info('Closed HTTP server. Process exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
