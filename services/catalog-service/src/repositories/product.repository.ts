import { PrismaClient, Product, Category } from '@prisma/client-catalog';
import { config } from '../config';

const prisma = new PrismaClient({
  datasources: {
    db: { url: config.databaseUrl }
  }
});

export class ProductRepository {
  async findMany(params: { skip: number; take: number; categoryId?: string; search?: string }): Promise<{ products: Product[]; total: number }> {
    const where: any = {};
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return { products, total };
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
  }

  async create(data: { name: string; slug: string; description: string; price: number; stock: number; categoryId?: string; imageUrl?: string }): Promise<Product> {
    return prisma.product.create({ data, include: { category: true } });
  }

  async findCategories(): Promise<Category[]> {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(data: { name: string; slug: string; description?: string }): Promise<Category> {
    return prisma.category.create({ data });
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

export const productRepository = new ProductRepository();
