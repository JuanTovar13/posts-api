import { Request, Response, NextFunction } from "express"
import * as service from "./store.service"
import { supabase } from "../../config/supabase";
import { getStoreByUserId } from "./store.service";

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

export const getMyStore = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Missing token" });
    }

    const token = authHeader.replace("Bearer ", "");

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const store = await getStoreByUserId(data.user.id);

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

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