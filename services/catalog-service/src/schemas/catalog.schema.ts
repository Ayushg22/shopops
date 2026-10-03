import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(5, 'Description is required'),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional()
});

export const queryProductsSchema = z.object({
  page: z.string().transform((v) => parseInt(v, 10)).default('1'),
  limit: z.string().transform((v) => parseInt(v, 10)).default('20'),
  categoryId: z.string().optional(),
  search: z.string().optional()
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Category slug is required'),
  description: z.string().optional()
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type QueryProductsInput = z.infer<typeof queryProductsSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
