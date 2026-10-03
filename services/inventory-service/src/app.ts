import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { Logger, createHttpLoggingMiddleware } from '@shopops/logger';
import { inventoryRepository } from './repositories/inventory.repository';
import { startInventoryConsumer, eventBus } from './events/inventory.consumer';

const logger = new Logger(config.serviceName);
const app = express();

app.use(cors());
app.use(express.json());
app.use(createHttpLoggingMiddleware(logger));

// Get Stock
app.get('/api/v1/inventory/:productId', async (req: Request, res: Response) => {
  const stock = await inventoryRepository.getStock(req.params.productId as string);
  res.json({ success: true, data: stock || { productId: req.params.productId, availableQuantity: 0 } });
});

// Seed Stock Endpoint
app.post('/api/v1/inventory/seed', async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  const stock = await inventoryRepository.setStock(productId, quantity || 100);
  res.json({ success: true, data: stock });
});

// Probes
app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: config.serviceName });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  const dbHealthy = await inventoryRepository.checkHealth();
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
  logger.info(`Inventory service listening on port ${config.port}`);
  try {
    await startInventoryConsumer();
  } catch (err) {
    logger.error('Failed to start Inventory Consumer', err);
  }
});

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await inventoryRepository.disconnect();
  await eventBus.disconnect();
  server.close(() => {
    logger.info('Closed HTTP server. Process exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
