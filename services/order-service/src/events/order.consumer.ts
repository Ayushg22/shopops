import { eventBus, orderService } from '../services/order.service';
import { PaymentCompletedPayload } from '@shopops/shared-types';

export async function startOrderConsumer() {
  await eventBus.subscribe<PaymentCompletedPayload>(
    'order-service-events',
    ['payment.completed', 'inventory.reservation_failed'],
    async (event) => {
      console.log(`[OrderConsumer] Received event ${event.eventType} for order ${event.payload.orderId}`);
      if (event.eventType === 'payment.completed') {
        await orderService.markCompleted(event.payload.orderId);
      } else if (event.eventType === 'inventory.reservation_failed') {
        await orderService.markCancelled(event.payload.orderId);
      }
    }
  );
  console.log('[OrderConsumer] Subscribed to payment.completed and inventory.reservation_failed');
}
