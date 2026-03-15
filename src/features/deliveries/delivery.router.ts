import { Router } from "express"
import * as controller from "./delivery.controller"
import { authMiddleware } from "../../middlewares/authMiddleware";
import { rolesMiddleware } from "../../middlewares/rolesMiddleware"
import { UserRole } from "../auth/auth.types";


export const deliveryRouter = Router()

deliveryRouter.use(authMiddleware);
deliveryRouter.use(rolesMiddleware([UserRole.DELIVERY]));

// ver órdenes disponibles
deliveryRouter.get("/orders/available", controller.getAvailableOrdersController)

// ver órdenes de un delivery
deliveryRouter.post("/orders/:id/accept", controller.acceptOrderController)

// tomar orden
deliveryRouter.get("/orders/my", controller.getMyOrdersController);