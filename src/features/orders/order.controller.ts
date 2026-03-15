import { Request, Response, NextFunction } from "express"
import * as service from "./order.service"
import Boom from "@hapi/boom";
import { createOrderService } from "./order.service";
import { getUserFromRequest } from "../../middlewares/authMiddleware";

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const orders = await service.getOrders()

    res.json(orders)

  } catch (err) {
    next(err)
  }

}


export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const { id } = req.params

    const order = await service.getOrderById(String(id))

    res.json(order)

  } catch (err) {
    next(err)
  }

}


export const createOrderController = async (req: Request, res: Response) => {

  if (!req.body) {
    throw Boom.badRequest("Request body is required");
  }

  const { store_id } = req.body;

  if (!store_id) {
    throw Boom.badRequest("store_id is required");
  }

  const user = getUserFromRequest(req);

  const order = await createOrderService(
    String(user.id),
    String(store_id)
  );

  return res.status(201).json(order);
};

export const assignDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const { id } = req.params
    const { delivery_id } = req.body

    const order = await service.assignDelivery(
      String(id),
      delivery_id
    )

    res.json(order)

  } catch (err) {
    next(err)
  }

}