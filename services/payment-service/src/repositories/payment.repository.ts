import { PrismaClient, Payment } from '@prisma/client-payment';
import { config } from '../config';

const prisma = new PrismaClient({
  datasources: {
    db: { url: config.databaseUrl }
  }
});

export class PaymentRepository {
  async processPayment(orderId: string, amount: number): Promise<Payment> {
    return prisma.payment.create({
      data: {
        orderId,
        amount,
        status: 'SUCCESS',
        transactionRef: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      }
    });
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { orderId } });
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

export const paymentRepository = new PaymentRepository();
