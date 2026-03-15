import { Request, Response, NextFunction } from "express"
import * as service from "./delivery.service"

export const getAvailableOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const orders = await service.getAvailableOrders()

    res.json(orders)

  } catch (err) {
    next(err)
  }

}


export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const { id } = req.params

    const orders = await service.getMyOrders(String(id))

    res.json(orders)

  } catch (err) {
    next(err)
  }

}


export const takeOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const { id } = req.params
    const { delivery_id } = req.body

    const order = await service.takeOrder(
      String(id),
      delivery_id
    )

    res.json(order)

  } catch (err) {
    next(err)
  }

}