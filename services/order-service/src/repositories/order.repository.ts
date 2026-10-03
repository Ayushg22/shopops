import { PrismaClient, Order, OrderStatus } from '@prisma/client-order';
import { config } from '../config';

const prisma = new PrismaClient({
  datasources: {
    db: { url: config.databaseUrl }
  }
});

export class OrderRepository {
  async create(data: { customerId: string; totalAmount: number; items: Array<{ productId: string; quantity: number; unitPrice: number }> }): Promise<Order> {
    return prisma.order.create({
      data: {
        customerId: data.customerId,
        totalAmount: data.totalAmount,
        status: 'PENDING',
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice
          }))
        }
      },
      include: { items: true }
    });
  }

  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
  }

  async findMany(customerId?: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: customerId ? { customerId } : undefined,
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true }
    });
  }

  async checkHealth(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

export const orderRepository = new OrderRepository();
