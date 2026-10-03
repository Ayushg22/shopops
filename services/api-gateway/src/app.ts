import express, { Request, Response } from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from './config';
import { Logger, createHttpLoggingMiddleware } from '@shopops/logger';

const logger = new Logger(config.serviceName);
const app = express();

app.use(cors());
// Note: We avoid global express.json() before proxying so streaming request bodies pass cleanly
app.use(createHttpLoggingMiddleware(logger));

// Correlation ID & Security Headers
app.use((req, res, next) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || `gw-${Date.now()}`;
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
});

// Proxy routes to Microservices
app.use(
  '/api/v1/auth',
  createProxyMiddleware({
    target: config.authServiceUrl,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/auth${path}`
  })
);

app.use(
  '/api/v1/catalog',
  createProxyMiddleware({
    target: config.catalogServiceUrl,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/catalog${path}`
  })
);

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
      catalog: config.catalogServiceUrl
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
