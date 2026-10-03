import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { createOrderSchema } from '../schemas/order.schema';

export class OrderController {
  async create(req: Request, res: Response) {
    try {
      const correlationId = (req.headers['x-correlation-id'] as string) || `ord-${Date.now()}`;
      const validated = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(validated, correlationId);

      return res.status(201).json({
        success: true,
        data: order,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || (error.name === 'ZodError' ? 400 : 500);
      return res.status(statusCode).json({
        success: false,
        error: { code: 'ORDER_CREATION_FAILED', message: error.message, details: error.errors }
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const order = await orderService.getOrder(req.params.id as string);
      return res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: error.message }
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const customerId = req.query.customerId as string | undefined;
      const orders = await orderService.listOrders(customerId);
      return res.status(200).json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}

export const orderController = new OrderController();
