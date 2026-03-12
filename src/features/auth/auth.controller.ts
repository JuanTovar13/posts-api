import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import { AuthService } from './auth.service';
import { UserRole } from './auth.types';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  authenticateUser = async (req: Request, res: Response) => {
    if (!req.body) {
      throw Boom.badRequest('Request body is required');
    }

    const { email, password } = req.body;

    if (email === undefined) {
      throw Boom.badRequest('Email is required');
    }

    if (password === undefined) {
      throw Boom.badRequest('Password is required');
    }

    const user = await this.authService.authenticateUser({ email, password });
    return res.json(user);
  };

  createUser = async (req: Request, res: Response) => {
    if (!req.body) {
      throw Boom.badRequest('Request body is required');
    }

    const { email, password, role } = req.body;

    if (email === undefined) {
      throw Boom.badRequest('Email is required');
    }

    if (password === undefined) {
      throw Boom.badRequest('Password is required');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw Boom.badRequest(
        `Role must be one of: ${Object.values(UserRole).join(', ')}`
      );
    }

    const user = await this.authService.createUser({ email, password, role });
    return res.status(201).json(user);
  };
}
