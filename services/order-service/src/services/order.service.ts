import { orderRepository } from '../repositories/order.repository';
import { CreateOrderInput } from '../schemas/order.schema';
import { EventBus, OrderCreatedPayload } from '@shopops/shared-types';
import { config } from '../config';

const eventBus = new EventBus(config.rabbitmqUrl, config.serviceName);

export class OrderService {
  async createOrder(input: CreateOrderInput, correlationId: string) {
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const order = await orderRepository.create({
      customerId: input.customerId,
      totalAmount,
      items: input.items
    });

    const payload: OrderCreatedPayload = {
      orderId: order.id,
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      items: input.items
    };

    // Publish asynchronous event
    await eventBus.publish('order.created', payload, correlationId);
    console.log(`[OrderService] Published order.created event for order ${order.id}`);

    return order;
  }

  async getOrder(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      const err = new Error('Order not found');
      (err as any).statusCode = 404;
      throw err;
    }
    return order;
  }

  async listOrders(customerId?: string) {
    return orderRepository.findMany(customerId);
  }

  async markCompleted(orderId: string) {
    console.log(`[OrderService] Marking order ${orderId} as COMPLETED`);
    return orderRepository.updateStatus(orderId, 'COMPLETED');
  }

  async markCancelled(orderId: string) {
    console.log(`[OrderService] Marking order ${orderId} as CANCELLED`);
    return orderRepository.updateStatus(orderId, 'CANCELLED');
  }
}

export const orderService = new OrderService();
export { eventBus };
