import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import * as service from './order.service';
import { getUserFromRequest } from '../../middlewares/authMiddleware';

export const getOrders = async (
  _req: Request,
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
    const order = await service.getOrderById(id);
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
    const orders = await service.getOrdersWithItemsByConsumerService(id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getPendingOrdersController = async (
  _req: Request,
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

export const createOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { consumer_id, store_id, destination_lat, destination_lng, items } = req.body;

    if (!consumer_id || !store_id) {
      throw Boom.badRequest('consumer_id and store_id are required');
    }
    if (typeof destination_lat !== 'number' || typeof destination_lng !== 'number') {
      throw Boom.badRequest('destination_lat and destination_lng must be numbers');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw Boom.badRequest('items must be a non-empty array');
    }

    const order = await service.createOrderService({
      consumer_id,
      store_id,
      destination_lat,
      destination_lng,
      items,
    });

    res.status(201).json(order);
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
    const order = await service.deleteOrderService(id);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const acceptOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = getUserFromRequest(req);
    const order = await service.acceptOrderService(id, user.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const updateDeliveryPositionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = getUserFromRequest(req);
    const { lat, lng } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw Boom.badRequest('lat and lng must be numbers');
    }

    const result = await service.updateDeliveryPositionService(id, user.id, { lat, lng });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
