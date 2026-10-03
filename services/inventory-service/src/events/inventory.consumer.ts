import { EventBus, OrderCreatedPayload, InventoryReservedPayload } from '@shopops/shared-types';
import { inventoryRepository } from '../repositories/inventory.repository';
import { config } from '../config';

export const eventBus = new EventBus(config.rabbitmqUrl, config.serviceName);

export async function startInventoryConsumer() {
  await eventBus.subscribe<OrderCreatedPayload>(
    'inventory-service-orders',
    ['order.created'],
    async (event) => {
      console.log(`[InventoryConsumer] Checking inventory for order ${event.payload.orderId}`);
      const success = await inventoryRepository.reserveStock(event.payload.orderId, event.payload.items);

      if (success) {
        const payload: InventoryReservedPayload = {
          orderId: event.payload.orderId,
          reservationId: `res-${Date.now()}`,
          items: event.payload.items
        };
        await eventBus.publish('inventory.reserved', payload, event.correlationId);
        console.log(`[InventoryConsumer] Stock reserved for order ${event.payload.orderId}. Published inventory.reserved`);
      } else {
        await eventBus.publish('inventory.reservation_failed', { orderId: event.payload.orderId }, event.correlationId);
        console.warn(`[InventoryConsumer] Insufficient stock for order ${event.payload.orderId}. Published inventory.reservation_failed`);
      }
    }
  );
  console.log('[InventoryConsumer] Subscribed to order.created');
}
