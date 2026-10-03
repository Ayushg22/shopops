import { PrismaClient, User, Role } from '@prisma/client-auth';
import { config } from '../config';

const prisma = new PrismaClient({
  datasources: {
    db: { url: config.databaseUrl }
  }
});

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: { email: string; passwordHash: string; name: string; role?: Role }): Promise<User> {
    return prisma.user.create({ data });
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

export const userRepository = new UserRepository();
