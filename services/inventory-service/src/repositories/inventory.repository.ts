import { PrismaClient, Stock } from '@prisma/client-inventory';
import { config } from '../config';

const prisma = new PrismaClient({
  datasources: {
    db: { url: config.databaseUrl }
  }
});

export class InventoryRepository {
  async getStock(productId: string): Promise<Stock | null> {
    return prisma.stock.findUnique({ where: { productId } });
  }

  async setStock(productId: string, quantity: number): Promise<Stock> {
    return prisma.stock.upsert({
      where: { productId },
      update: { availableQuantity: quantity },
      create: { productId, availableQuantity: quantity, reservedQuantity: 0 }
    });
  }

  async reserveStock(orderId: string, items: Array<{ productId: string; quantity: number }>): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      // 1. Verify all stock available
      for (const item of items) {
        const stock = await tx.stock.findUnique({ where: { productId: item.productId } });
        if (!stock || stock.availableQuantity < item.quantity) {
          return false;
        }
      }

      // 2. Deduct available, increase reserved
      for (const item of items) {
        await tx.stock.update({
          where: { productId: item.productId },
          data: {
            availableQuantity: { decrement: item.quantity },
            reservedQuantity: { increment: item.quantity }
          }
        });
      }

      // 3. Create Reservation record
      await tx.reservation.create({
        data: {
          orderId,
          status: 'RESERVED'
        }
      });

      return true;
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

export const inventoryRepository = new InventoryRepository();
