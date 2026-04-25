import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import * as service from './order.service';
import { getUserFromRequest } from '../../middlewares/authMiddleware';
import { OrderStatus } from '../auth/auth.types';


const VALID_STATUSES = Object.values(OrderStatus);

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
    const id = req.params.id as string;
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
    const id = req.params.id as string;
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
    const id = req.params.id as string;
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
    const id = req.params.id as string;
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
    const id = req.params.id as string;
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

export const updateOrderStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = getUserFromRequest(req);
    const { status } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!VALID_STATUSES.includes(status)) {
      throw Boom.badRequest(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const order = await service.updateOrderStatusService(id, user.id, status as OrderStatus);
    res.json(order);
  } catch (err) { next(err); }
};