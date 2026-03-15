import { Router } from "express"
import * as controller from "./product.controller"
import { authMiddleware } from "../../middlewares/authMiddleware";
import { rolesMiddleware } from "../../middlewares/rolesMiddleware"
import { UserRole } from "../auth/auth.types";

export const productsRouter = Router()

productsRouter.use(authMiddleware);
// ver todos los productos
productsRouter.get("/", controller.getProducts)

// productos de una tienda
productsRouter.get("/store/:id", controller.getProductsByStore)

// ver producto
productsRouter.get("/:id", controller.getProduct)

// crear producto
productsRouter.post("/",rolesMiddleware([UserRole.STORE]), controller.createProduct)

// eliminar producto
productsRouter.delete("/:id",rolesMiddleware([UserRole.STORE]), controller.deleteProduct)