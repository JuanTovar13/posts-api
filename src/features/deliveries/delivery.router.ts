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

// tomar orden
deliveryRouter.post("/orders/:id/accept", controller.acceptOrderController)

// ver órdenes de un delivery
deliveryRouter.get("/orders/my", controller.getMyOrdersController);

//declinar orden
deliveryRouter.patch("/orders/:id/decline",controller.declineOrderController);