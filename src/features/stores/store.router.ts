import { Router } from "express"
import * as controller from "./store.controller"
import { authMiddleware } from "../../middlewares/authMiddleware";


export const storesRouter = Router()

storesRouter.use(authMiddleware);

// ver todas las tiendas
storesRouter.get("/", controller.getStores)

// ver tienda específica
storesRouter.get("/:id", controller.getStore)


// crear tienda
storesRouter.post("/", controller.createStore)

// abrir tienda
storesRouter.patch("/:id/open", controller.openStore)

// cerrar tienda
storesRouter.patch("/:id/close", controller.closeStore)