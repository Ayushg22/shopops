import { z } from 'zod';

export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'productId is required'),
      quantity: z.number().int().positive('quantity must be > 0'),
      unitPrice: z.number().positive('unitPrice must be > 0')
    })
  ).min(1, 'At least 1 item is required')
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
