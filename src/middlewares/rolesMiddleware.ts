import { Request, Response, NextFunction } from "express";
import Boom from "@hapi/boom";
import { pool } from "../config/database";
import { AuthUser } from "@supabase/supabase-js";
import { UserRole } from "../features/auth/auth.types";
import { getUserFromRequest } from "./authMiddleware";

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const rolesMiddleware = (roles: UserRole[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {

    const user = getUserFromRequest(req);

    const result = await pool.query(
      `
      SELECT role
      FROM users
      WHERE id = $1
      `,
      [user.id]
    );

    const poolUser = result.rows[0];

    if (!poolUser) {
      throw Boom.notFound("User not found");
    }

    if (!roles.includes(poolUser.role)) {
      throw Boom.forbidden("Insufficient permissions");
    }

    next();
  };
};