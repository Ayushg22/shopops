import { PrismaClient } from '@prisma/client-catalog';
import { config } from '../config';

const prisma = new PrismaClient({
  datasources: {
    db: { url: config.databaseUrl }
  }
});

async function main() {
  console.log('[Seed] Seeding categories and products in shopops_catalog...');

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Gadgets, devices, and accessories'
    }
  });

  const apparel = await prisma.category.create({
    data: {
      name: 'Apparel',
      slug: 'apparel',
      description: 'Clothing, activewear, and shoes'
    }
  });

  const products = [
    {
      name: 'Cloud-Native Developer Laptop Pro',
      slug: 'cloud-native-developer-laptop-pro',
      description: 'High-performance laptop optimized for Docker, Kubernetes, and local LLM workflows.',
      price: 1999.99,
      stock: 45,
      categoryId: electronics.id,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8'
    },
    {
      name: 'Noise-Cancelling SRE Headphones',
      slug: 'noise-cancelling-sre-headphones',
      description: 'Over-ear wireless headphones designed for on-call focus and deep engineering work.',
      price: 299.99,
      stock: 120,
      categoryId: electronics.id,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
    },
    {
      name: 'UltraWide Ergonomic Monitor 34"',
      slug: 'ultrawide-ergonomic-monitor-34',
      description: 'Curved IPS display with 144Hz refresh rate, USB-C hub, and dual-window multitasking.',
      price: 549.50,
      stock: 30,
      categoryId: electronics.id,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf'
    },
    {
      name: 'ShopOps DevOps Engineer Hoodie',
      slug: 'shopops-devops-engineer-hoodie',
      description: 'Premium heavyweight cotton hoodie featuring declarative GitOps pipeline diagram.',
      price: 59.99,
      stock: 200,
      categoryId: apparel.id,
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2'
    },
    {
      name: 'Kubernetes Architecture Desk Mat',
      slug: 'kubernetes-architecture-desk-mat',
      description: 'Anti-slip extended gaming mouse pad with complete K8s resource diagram.',
      price: 24.99,
      stock: 350,
      categoryId: electronics.id,
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'
    }
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log(`[Seed] Seeded 2 categories and ${products.length} products successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
