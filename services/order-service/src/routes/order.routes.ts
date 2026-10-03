import { Router } from 'express';
import { orderController } from '../controllers/order.controller';

export const orderRoutes = Router();

orderRoutes.post('/', (req, res) => orderController.create(req, res));
orderRoutes.get('/', (req, res) => orderController.list(req, res));
orderRoutes.get('/:id', (req, res) => orderController.getById(req, res));
