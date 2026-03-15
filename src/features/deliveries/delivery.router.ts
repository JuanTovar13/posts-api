import { Router } from "express"
import * as controller from "./delivery.controller"
import { authMiddleware } from "../../middlewares/authMiddleware";
import { rolesMiddleware } from "../../middlewares/rolesMiddleware"
import { UserRole } from "../auth/auth.types";

export const deliveryRouter = Router()

deliveryRouter.use(authMiddleware);
deliveryRouter.use(rolesMiddleware([UserRole.DELIVERY]));

// ver órdenes disponibles
deliveryRouter.get("/available", controller.getAvailableOrders)

// ver órdenes de un delivery
deliveryRouter.get("/my-orders/:id", controller.getMyOrders)

// tomar orden
deliveryRouter.patch("/take/:id", controller.takeOrder)