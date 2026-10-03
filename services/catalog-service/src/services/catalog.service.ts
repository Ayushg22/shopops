import { productRepository } from '../repositories/product.repository';
import { CreateProductInput, QueryProductsInput, CreateCategoryInput } from '../schemas/catalog.schema';

export class CatalogService {
  async listProducts(query: QueryProductsInput) {
    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    const skip = (page - 1) * limit;

    const { products, total } = await productRepository.findMany({
      skip,
      take: limit,
      categoryId: query.categoryId,
      search: query.search
    });

    return {
      items: products,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getProduct(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      const err = new Error('Product not found');
      (err as any).statusCode = 404;
      throw err;
    }
    return product;
  }

  async createProduct(input: CreateProductInput) {
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
    return productRepository.create({
      ...input,
      slug
    });
  }

  async listCategories() {
    return productRepository.findCategories();
  }

  async createCategory(input: CreateCategoryInput) {
    return productRepository.createCategory(input);
  }
}

export const catalogService = new CatalogService();
