import express, { Request, Response } from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from './config';
import { Logger, createHttpLoggingMiddleware } from '@shopops/logger';

const logger = new Logger(config.serviceName);
const app = express();

app.use(cors());
app.use(createHttpLoggingMiddleware(logger));

// Correlation ID & Security Headers
app.use((req, res, next) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || `gw-${Date.now()}`;
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
});

// Proxy routes to all Microservices (using pathFilter to preserve exact URLs without Express route stripping)
app.use(createProxyMiddleware({ target: config.authServiceUrl, changeOrigin: true, pathFilter: '/api/v1/auth' }));
app.use(createProxyMiddleware({ target: config.catalogServiceUrl, changeOrigin: true, pathFilter: '/api/v1/catalog' }));
app.use(createProxyMiddleware({ target: config.orderServiceUrl, changeOrigin: true, pathFilter: '/api/v1/orders' }));
app.use(createProxyMiddleware({ target: config.inventoryServiceUrl, changeOrigin: true, pathFilter: '/api/v1/inventory' }));
app.use(createProxyMiddleware({ target: config.paymentServiceUrl, changeOrigin: true, pathFilter: '/api/v1/payments' }));
app.use(createProxyMiddleware({ target: config.notificationServiceUrl, changeOrigin: true, pathFilter: '/api/v1/notifications' }));

// Probes
app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: config.serviceName });
});

app.get('/health/ready', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'READY',
    service: config.serviceName,
    targets: {
      auth: config.authServiceUrl,
      catalog: config.catalogServiceUrl,
      order: config.orderServiceUrl,
      inventory: config.inventoryServiceUrl,
      payment: config.paymentServiceUrl,
      notification: config.notificationServiceUrl
    }
  });
});

app.get('/metrics', (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send('# HELP up Service up indicator\n# TYPE up gauge\nup 1\n');
});

const server = app.listen(config.port, () => {
  logger.info(`API Gateway listening on port ${config.port}`);
});

const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Closed HTTP server. Process exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
