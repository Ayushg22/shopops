import { Router } from 'express';
import { catalogController } from '../controllers/catalog.controller';

export const catalogRoutes = Router();

catalogRoutes.get('/products', (req, res) => catalogController.getProducts(req, res));
catalogRoutes.get('/products/:id', (req, res) => catalogController.getProductById(req, res));
catalogRoutes.post('/products', (req, res) => catalogController.createProduct(req, res));
catalogRoutes.get('/categories', (req, res) => catalogController.getCategories(req, res));
catalogRoutes.post('/categories', (req, res) => catalogController.createCategory(req, res));
