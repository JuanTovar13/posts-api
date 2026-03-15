import { Request, Response } from "express";
import Boom from "@hapi/boom";
import {
  getAvailableOrdersService,
  acceptOrderService,
  getMyOrdersService
} from "./delivery.service";
import { getUserFromRequest } from "../../middlewares/authMiddleware";

export const getAvailableOrdersController = async (
  req: Request,
  res: Response
) => {

  const orders = await getAvailableOrdersService();

  return res.json(orders);
};

export const acceptOrderController = async (
  req: Request,
  res: Response
) => {

  const { id } = req.params;

  if (!id) {
    throw Boom.badRequest("Order id is required");
  }

  const user = getUserFromRequest(req);

  const order = await acceptOrderService(
    String(id),
    String(user.id)
  );

  return res.json(order);
};

export const getMyOrdersController = async (
  req: Request,
  res: Response
) => {

  const user = getUserFromRequest(req);

  const orders = await getMyOrdersService(String(user.id));

  return res.json(orders);
};