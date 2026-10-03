import { Request, Response } from 'express';
import { catalogService } from '../services/catalog.service';
import { queryProductsSchema, createProductSchema, createCategorySchema } from '../schemas/catalog.schema';

export class CatalogController {
  async getProducts(req: Request, res: Response) {
    try {
      const validated = queryProductsSchema.parse(req.query);
      const result = await catalogService.listProducts(validated);

      return res.status(200).json({
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: (req.headers['x-correlation-id'] as string) || ''
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'FETCH_PRODUCTS_FAILED', message: error.message }
      });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const product = await catalogService.getProduct(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: product,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: (req.headers['x-correlation-id'] as string) || ''
        }
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: error.message }
      });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const validated = createProductSchema.parse(req.body);
      const product = await catalogService.createProduct(validated);
      return res.status(201).json({
        success: true,
        data: product,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: (req.headers['x-correlation-id'] as string) || ''
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || (error.name === 'ZodError' ? 400 : 500);
      return res.status(statusCode).json({
        success: false,
        error: { code: 'CREATE_PRODUCT_FAILED', message: error.message, details: error.errors }
      });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await catalogService.listCategories();
      return res.status(200).json({
        success: true,
        data: categories,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: (req.headers['x-correlation-id'] as string) || ''
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'FETCH_CATEGORIES_FAILED', message: error.message }
      });
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const validated = createCategorySchema.parse(req.body);
      const category = await catalogService.createCategory(validated);
      return res.status(201).json({
        success: true,
        data: category,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: (req.headers['x-correlation-id'] as string) || ''
        }
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: { code: 'CREATE_CATEGORY_FAILED', message: error.message }
      });
    }
  }
}

export const catalogController = new CatalogController();
