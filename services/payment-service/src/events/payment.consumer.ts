import { EventBus, InventoryReservedPayload, PaymentCompletedPayload } from '@shopops/shared-types';
import { paymentRepository } from '../repositories/payment.repository';
import { config } from '../config';

export const eventBus = new EventBus(config.rabbitmqUrl, config.serviceName);

export async function startPaymentConsumer() {
  await eventBus.subscribe<InventoryReservedPayload>(
    'payment-service-reservations',
    ['inventory.reserved'],
    async (event) => {
      console.log(`[PaymentConsumer] Processing payment for order ${event.payload.orderId}`);
      
      // Calculate simulated amount based on items
      const amount = event.payload.items.reduce((sum, item) => sum + item.quantity * 29.99, 0);
      const payment = await paymentRepository.processPayment(event.payload.orderId, amount);

      const payload: PaymentCompletedPayload = {
        orderId: payment.orderId,
        paymentId: payment.id,
        amount: payment.amount,
        status: 'SUCCESS'
      };

      await eventBus.publish('payment.completed', payload, event.correlationId);
      console.log(`[PaymentConsumer] Payment SUCCESS for order ${payment.orderId}. Published payment.completed`);
    }
  );
  console.log('[PaymentConsumer] Subscribed to inventory.reserved');
}
