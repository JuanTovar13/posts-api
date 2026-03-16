import { Request, Response, NextFunction } from "express"
import * as service from "./order.service"
import Boom from "@hapi/boom";
import { createOrderService, getOrdersByConsumerService } from "./order.service";
import { getUserFromRequest } from "../../middlewares/authMiddleware";
import { getOrdersWithItemsByConsumerService } from "./order.service";

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


export const createOrderController = async (
  req: Request,
  res: Response
) => {

  const { consumer_id, store_id, items } = req.body;

  const order = await service.createOrderService(
    consumer_id,
    store_id,
    items
  );

  res.json(order);
};

export const getOrdersByConsumerController = async (
  req: Request,
  res: Response
) => {

  const { id } = req.params;

  const orders = await getOrdersWithItemsByConsumerService(String(id));

  res.json(orders);
};

export const deleteOrderController = async (
  req: Request,
  res: Response
) => {

  const { id } = req.params;

  const order = await service.deleteOrderService(String(id));

  res.json(order);
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