import { Router } from "express"
import {
  authenticateUserController,
  createUserController
} from "./auth.controller"

export const authRouter = Router()

authRouter.post(
  "/login",
  authenticateUserController
)

authRouter.post(
  "/register",
  createUserController
)