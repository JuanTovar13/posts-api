import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import {
  getPositionsController,
  createPositionController,
  updatePositionController,
  deletePositionController,
} from "./position.controller";

export const router = Router();
router.use(authMiddleware);
router.get("/", getPositionsController);
router.post("/", createPositionController);
router.patch("/", updatePositionController);
router.delete("/", deletePositionController);
