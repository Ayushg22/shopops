import dotenv from 'dotenv';
dotenv.config();

export const config = {
  serviceName: 'inventory-service',
  port: parseInt(process.env.PORT || '8004', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
};
