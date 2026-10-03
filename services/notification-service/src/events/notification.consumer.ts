import { EventBus, BaseEvent } from '@shopops/shared-types';
import Redis from 'ioredis';
import { config } from '../config';

export const redis = new Redis(config.redisUrl);
export const eventBus = new EventBus(config.rabbitmqUrl, config.serviceName);

export async function startNotificationConsumer() {
  await eventBus.subscribe(
    'notification-service-queue',
    ['order.created', 'payment.completed'],
    async (event: BaseEvent<any>) => {
      console.log(`[NotificationService] Processing notification for event ${event.eventType} (Correlation: ${event.correlationId})`);
      
      const notification = {
        id: `notif-${Date.now()}`,
        type: event.eventType,
        orderId: event.payload.orderId,
        message: event.eventType === 'order.created' 
          ? `Order #${event.payload.orderId} received. Verification in progress.`
          : `Payment successful for Order #${event.payload.orderId}. Your receipt is ready.`,
        timestamp: new Date().toISOString()
      };

      // Store in Redis (list per customer / order)
      await redis.lpush(`notifications:${event.payload.customerId || event.payload.orderId}`, JSON.stringify(notification));
      console.log(`[NotificationService] Dispatched: "${notification.message}"`);
    }
  );
  console.log('[NotificationService] Subscribed to order.created and payment.completed');
}
