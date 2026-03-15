import { Request, Response, NextFunction } from "express"
import * as service from "./users.service"


export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const users = await service.getUsers()

    res.json(users)

  } catch (err) {

    next(err)

  }

}


export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    const { id } = req.params;
    const user = await service.getUserById(String(id))

    res.json(user)

  } catch (err) {

    next(err)

  }

}


export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const user = await service.createUser(req.body)

    res.status(201).json(user)

  } catch (err) {

    next(err)

  }

}