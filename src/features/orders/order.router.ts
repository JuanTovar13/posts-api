import { Router } from "express"
import * as controller from "./order.controller"
import { authMiddleware } from '../../middlewares/authMiddleware';
import { rolesMiddleware } from '../../middlewares/rolesMiddleware';
import { UserRole } from '../auth/auth.types';

export const ordersRouter = Router()

ordersRouter.use(authMiddleware);
// ver órdenes
ordersRouter.get("/", controller.getOrders)

// ver orden específica
ordersRouter.get("/:id", controller.getOrder)

// crear orden
ordersRouter.post("/",rolesMiddleware([UserRole.CONSUMER]), controller.createOrder)

// asignar delivery
ordersRouter.patch("/:id/delivery", rolesMiddleware([UserRole.DELIVERY]), controller.assignDelivery)