
import { Router } from "express"
import * as controller from "./order.controller"
import { authMiddleware } from '../../middlewares/authMiddleware';
import { rolesMiddleware } from '../../middlewares/rolesMiddleware';
import { UserRole } from '../auth/auth.types';

export const ordersRouter = Router()

ordersRouter.use(authMiddleware);
// ver órdenes
ordersRouter.get("/", controller.getOrders)

//ver ordenes de un consumidor
ordersRouter.get("/consumer/:id", controller.getOrdersByConsumerController)

// ver orden específica
ordersRouter.get("/:id", controller.getOrder)

// borrar orden
ordersRouter.delete("/:id",rolesMiddleware([UserRole.CONSUMER]),controller.deleteOrderController);

// crear orden
ordersRouter.post("/",rolesMiddleware([UserRole.CONSUMER]), controller.createOrderController)

// asignar delivery
ordersRouter.patch("/:id/delivery", rolesMiddleware([UserRole.DELIVERY]), controller.assignDelivery)