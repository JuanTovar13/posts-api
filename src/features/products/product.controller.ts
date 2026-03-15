import { Request, Response, NextFunction } from "express"
import * as service from "./product.service"


export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const products = await service.getProducts()

    res.json(products)

  } catch (err) {
    next(err)
  }

}


export const getProductsByStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const { id } = req.params

    const products = await service.getProductsByStore(String(id))

    res.json(products)

  } catch (err) {
    next(err)
  }

}


export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const { id } = req.params

    const product = await service.getProductById(String(id))

    res.json(product)

  } catch (err) {
    next(err)
  }

}


export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const product = await service.createProduct(req.body)

    res.status(201).json(product)

  } catch (err) {
    next(err)
  }

}


export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const { id } = req.params

    const product = await service.deleteProduct(String(id))

    res.json(product)

  } catch (err) {
    next(err)
  }

}