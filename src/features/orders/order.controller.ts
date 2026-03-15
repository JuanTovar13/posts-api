import { Request, Response, NextFunction } from "express"
import * as service from "./order.service"

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


export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const order = await service.createOrder(req.body)

    res.status(201).json(order)

  } catch (err) {
    next(err)
  }

}


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