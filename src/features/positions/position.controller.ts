import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import { getUserFromRequest } from '../../middlewares/authMiddleware';
import {
  getPositionsService,
  upsertPositionService,
  deletePositionService,
} from './position.service';

export const getPositionsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const positions = await getPositionsService();
    res.json(positions);
  } catch (err) {
    next(err);
  }
};

export const upsertPositionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromRequest(req);
    const { latitude, longitude } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw Boom.badRequest('latitude and longitude must be numbers');
    }

    const position = await upsertPositionService(user.id, { latitude, longitude });
    res.json(position);
  } catch (err) {
    next(err);
  }
};

export const deletePositionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromRequest(req);
    await deletePositionService(user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
