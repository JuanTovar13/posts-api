import { Request, Response } from "express";
import Boom from "@hapi/boom";
import { createOrderItemService } from "./items.service";

export const createOrderItemController = async (
  req: Request,
  res: Response
) => {

  if (!req.body) {
    throw Boom.badRequest("Request body is required");
  }

  const { order_id, product_id, quantity } = req.body;

  if (!order_id) {
    throw Boom.badRequest("order_id is required");
  }

  if (!product_id) {
    throw Boom.badRequest("product_id is required");
  }

  if (!quantity) {
    throw Boom.badRequest("quantity is required");
  }

  const item = await createOrderItemService(
    String(order_id),
    String(product_id),
    Number(quantity)
  );

  return res.status(201).json(item);
};