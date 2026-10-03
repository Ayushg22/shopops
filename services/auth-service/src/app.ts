import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { authRoutes } from './routes/auth.routes';
import { Logger, createHttpLoggingMiddleware } from '@shopops/logger';
import { userRepository } from './repositories/user.repository';

const logger = new Logger(config.serviceName);
const app = express();

app.use(cors());
app.use(express.json());
app.use(createHttpLoggingMiddleware(logger));

// API Routes
app.use('/api/v1/auth', authRoutes);

// Probes
app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: config.serviceName });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  const dbHealthy = await userRepository.checkHealth();
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

const server = app.listen(config.port, () => {
  logger.info(`Auth service listening on port ${config.port}`);
});

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await userRepository.disconnect();
  server.close(() => {
    logger.info('Closed HTTP server. Process exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
