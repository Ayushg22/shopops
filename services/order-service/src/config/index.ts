import dotenv from 'dotenv';
dotenv.config();

export const config = {
  serviceName: 'order-service',
  port: parseInt(process.env.PORT || '8003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
};
