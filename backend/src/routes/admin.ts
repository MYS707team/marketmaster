// backend/src/routes/admin.ts
import express from 'express';
import { 
  getStatistics, 
  getAllUsers, 
  grantAdminRole, 
  revokeAdminRole,
  getAllTransactions 
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';

const router = express.Router();

router.get('/statistics', authenticate, requireAdmin, getStatistics);
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.post('/grant-admin', authenticate, requireAdmin, grantAdminRole);
router.post('/revoke-admin/:userId', authenticate, requireAdmin, revokeAdminRole);
router.get('/transactions', authenticate, requireAdmin, getAllTransactions);

export default router;
