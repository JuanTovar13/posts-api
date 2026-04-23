import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  getPositionsController,
  upsertPositionController,
  deletePositionController,
} from './position.controller';

export const positionsRouter = Router();

positionsRouter.use(authMiddleware);

positionsRouter.get('/',  getPositionsController);
positionsRouter.put('/',  upsertPositionController);
positionsRouter.delete('/', deletePositionController);
