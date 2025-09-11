// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";

export function isAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user; // JWT attach user object
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin only" });
  }
  next();
}
