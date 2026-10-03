import { Request, Response, NextFunction } from 'express';

export interface LogContext {
  correlationId?: string;
  service?: string;
  userId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

export class Logger {
  constructor(private serviceName: string) {}

  private format(level: string, message: string, context?: LogContext) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...context
    });
  }

  info(message: string, context?: LogContext) {
    console.log(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    console.error(this.format('error', message, {
      ...context,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    }));
  }

  debug(message: string, context?: LogContext) {
    console.debug(this.format('debug', message, context));
  }
}

export function createHttpLoggingMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const correlationId = (req.headers['x-correlation-id'] as string) || `req-${Date.now()}`;
    res.setHeader('x-correlation-id', correlationId);

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      logger.info('HTTP request completed', {
        correlationId,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs
      });
    });

    next();
  };
}
