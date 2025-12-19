// backend/src/middleware/roleCheck.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !['user', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'User access required' });
  }
  next();
};
