import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import * as service from './order.service';
import { getUserFromRequest } from '../../middlewares/authMiddleware';
import { OrderStatus } from './order.types';

const VALID_STATUSES: OrderStatus[] = ['pending', 'accepted', 'delivered', 'cancelled'];

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await service.getOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const order = await service.getOrderById(String(id));
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const createOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { consumer_id, store_id, items } = req.body;
    const order = await service.createOrderService(consumer_id, store_id, items);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const getOrdersByConsumerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const orders = await service.getOrdersWithItemsByConsumerService(String(id));
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const deleteOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const order = await service.deleteOrderService(String(id));
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const assignDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = getUserFromRequest(req);
    const order = await service.assignDelivery(String(id), user.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const getPendingOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await service.getPendingOrdersService();
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      throw Boom.badRequest(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const order = await service.updateOrderStatusService(String(id), status as OrderStatus);
    res.json(order);
  } catch (err) {
    next(err);
  }
};
