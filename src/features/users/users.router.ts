import { Router } from "express"
import * as controller from "./users.controller"
import { authMiddleware } from "../../middlewares/authMiddleware";

export const usersRouter = Router()
usersRouter.use(authMiddleware);

usersRouter.get("/", controller.getUsers)

usersRouter.get("/:id", controller.getUser)

usersRouter.post("/", controller.createUser)
