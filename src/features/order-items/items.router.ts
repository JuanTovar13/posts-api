import { rolesMiddleware } from './../../middlewares/rolesMiddleware';
import { Router } from "express";
import { createOrderItemController } from "./items.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from '../auth/auth.types';


export const itemsRouter = Router();

itemsRouter.use(authMiddleware);

itemsRouter.post("/", rolesMiddleware([UserRole.CONSUMER]), createOrderItemController);

