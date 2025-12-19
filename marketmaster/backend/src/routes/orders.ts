// backend/src/routes/orders.ts
import express from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getAllOrders, 
  updateOrderStatus 
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireUser } from '../middleware/roleCheck';

const router = express.Router();

// User routes
router.post('/', authenticate, requireUser, createOrder);
router.get('/my-orders', authenticate, requireUser, getUserOrders);

// Admin routes
router.get('/all', authenticate, requireAdmin, getAllOrders);
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;
