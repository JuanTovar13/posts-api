import { Request, Response, NextFunction } from "express"
import * as service from "./store.service"

export const getStores = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const stores = await service.getStores()

    res.json(stores)

  } catch (err) {
    next(err)
  }

}


export const getStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    const { id } = req.params;
    const store = await service.getStoreById(String(id))

    res.json(store)

  } catch (err) {
    next(err)
  }

}


export const createStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const store = await service.createStore(req.body)

    res.status(201).json(store)

  } catch (err) {
    next(err)
  }

}


export const openStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    const { id } = req.params;
    const store = await service.openStore(String(id))

    res.json(store)

  } catch (err) {
    next(err)
  }

}


export const closeStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    const { id } = req.params;
    const store = await service.closeStore(String(id))

    res.json(store)

  } catch (err) {
    next(err)
  }

}