import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';

const app = express();
app.use(cors());
app.use(express.json());

// Correlation ID & basic logging middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || 'local-' + Date.now();
  res.setHeader('x-correlation-id', correlationId);
  next();
});

// Liveness Probe
app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: config.serviceName });
});

// Readiness Probe
app.get('/health/ready', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'READY', service: config.serviceName });
});

// Metrics placeholder
app.get('/metrics', (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send('# HELP up Service up indicator\n# TYPE up gauge\nup 1\n');
});

const server = app.listen(config.port, () => {
  console.log(`[${config.serviceName}] Listening on port ${config.port}`);
});

// Graceful Shutdown
const shutdown = (signal: string) => {
  console.log(`[${config.serviceName}] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log(`[${config.serviceName}] Closed all connections. Process exiting.`);
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
