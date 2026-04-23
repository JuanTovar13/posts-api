import { Router } from 'express';
import * as controller from './order.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { rolesMiddleware } from '../../middlewares/rolesMiddleware';
import { UserRole } from '../auth/auth.types';

export const ordersRouter = Router();

ordersRouter.use(authMiddleware);

// All orders
ordersRouter.get('/', controller.getOrders);

// Pending orders — for delivery role to browse and accept
ordersRouter.get('/pending', rolesMiddleware([UserRole.DELIVERY]), controller.getPendingOrdersController);

// Orders by consumer
ordersRouter.get('/consumer/:id', controller.getOrdersByConsumerController);

// Single order
ordersRouter.get('/:id', controller.getOrder);

// Create order
ordersRouter.post('/', rolesMiddleware([UserRole.CONSUMER]), controller.createOrderController);

// Delete order
ordersRouter.delete('/:id', rolesMiddleware([UserRole.CONSUMER]), controller.deleteOrderController);

// Delivery accepts order (self-assigns)
ordersRouter.patch('/:id/delivery', rolesMiddleware([UserRole.DELIVERY]), controller.assignDelivery);

// Update order status (delivery marks as delivered, store cancels, etc.)
ordersRouter.patch('/:id/status', authMiddleware, controller.updateOrderStatusController);
