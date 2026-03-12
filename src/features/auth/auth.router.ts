import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

export class AuthRouter {
  public router: Router;
  private authController: AuthController;

  constructor(authController: AuthController) {
    this.authController = authController;
    this.router = Router();
    this.router.use(authMiddleware);
    this.router.post('/login', this.authController.authenticateUser);
    this.router.post('/register', this.authController.createUser);
  }
}
