// backend/src/routes/cards.ts
import express from 'express';
import { 
  addCard, 
  getUserCards, 
  setDefaultCard, 
  deleteCard 
} from '../controllers/cardController';
import { authenticate } from '../middleware/auth';
import { requireUser } from '../middleware/roleCheck';

const router = express.Router();

router.post('/', authenticate, requireUser, addCard);
router.get('/', authenticate, requireUser, getUserCards);
router.patch('/:id/default', authenticate, requireUser, setDefaultCard);
router.delete('/:id', authenticate, requireUser, deleteCard);

export default router;
