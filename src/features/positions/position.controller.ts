import { Request, Response } from "express";
import Boom from "@hapi/boom";
import { getUserFromRequest } from "../../middlewares/authMiddleware";
import {
  getPositionsService,
  createPositionService,
  updatePositionService,
  deletePositionService,
} from "./position.service";

export const getPositionsController = async (req: Request, res: Response) => {
  const positions = await getPositionsService();
  return res.json(positions);
};

export const createPositionController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const { latitude, longitude } = req.body;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw Boom.badRequest("latitude and longitude must be numbers");
  }

  const position = await createPositionService(user.id, { latitude, longitude });
  return res.status(201).json(position);
};

export const updatePositionController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const { latitude, longitude } = req.body;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw Boom.badRequest("latitude and longitude must be numbers");
  }

  const position = await updatePositionService(user.id, {
    latitude,
    longitude,
  });
  return res.json(position);
};

export const deletePositionController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  await deletePositionService(user.id);
  return res.status(204).send();
};
