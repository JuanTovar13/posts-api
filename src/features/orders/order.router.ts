import { Router } from 'express';
import * as controller from './order.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { rolesMiddleware } from '../../middlewares/rolesMiddleware';
import { UserRole } from '../auth/auth.types';

export const ordersRouter = Router();

ordersRouter.use(authMiddleware);

// GET /api/orders — all orders (store can use this)
ordersRouter.get('/', controller.getOrders);

// GET /api/orders/pending — pending orders for delivery to browse
ordersRouter.get('/pending', rolesMiddleware([UserRole.DELIVERY]), controller.getPendingOrdersController);

// GET /api/orders/consumer/:id — orders by consumer with items
ordersRouter.get('/consumer/:id', controller.getOrdersByConsumerController);

// GET /api/orders/:id — single order detail with position
ordersRouter.get('/:id', controller.getOrder);

// POST /api/orders — consumer creates order with destination coords
ordersRouter.post('/', rolesMiddleware([UserRole.CONSUMER]), controller.createOrderController);

// DELETE /api/orders/:id — consumer deletes order
ordersRouter.delete('/:id', rolesMiddleware([UserRole.CONSUMER]), controller.deleteOrderController);

// PATCH /api/orders/:id/accept — delivery accepts order → status: "En entrega"
ordersRouter.patch('/:id/accept', rolesMiddleware([UserRole.DELIVERY]), controller.acceptOrderController);

// PATCH /api/orders/:id/position — delivery updates position → triggers ST_DWithin check
ordersRouter.patch('/:id/position', rolesMiddleware([UserRole.DELIVERY]), controller.updateDeliveryPositionController);
