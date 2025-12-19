// backend/src/controllers/cardController.ts
import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { cardSchema } from '../utils/validation';
import { getLastFourDigits } from '../utils/encryption';

export const addCard = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = cardSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv } = value;

    // Validate expiry date is in the future
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (parseInt(expiryYear) < currentYear || 
        (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
      return res.status(400).json({ error: 'Card has expired' });
    }

    // Extract last 4 digits only (never store full card number)
    const lastFour = getLastFourDigits(cardNumber);

    // Check if user already has this card
    const existingCard = await pool.query(
      'SELECT id FROM cards WHERE user_id = $1 AND last_four = $2',
      [req.user!.id, lastFour]
    );

    if (existingCard.rows.length > 0) {
      return res.status(400).json({ error: 'This card is already registered' });
    }

    // If this is the first card, make it default
    const cardCount = await pool.query(
      'SELECT COUNT(*) as count FROM cards WHERE user_id = $1',
      [req.user!.id]
    );
    const isDefault = parseInt(cardCount.rows[0].count) === 0;

    // Insert card (only last 4 digits, never full number)
    const result = await pool.query(
      `INSERT INTO cards (user_id, last_four, card_holder_name, expiry_month, expiry_year, card_brand, is_default) 
       VALUES ($1, $2, $3, $4, $5, 'Visa', $6) 
       RETURNING id, last_four, card_holder_name, expiry_month, expiry_year, card_brand, is_default, created_at`,
      [req.user!.id, lastFour, cardHolderName, expiryMonth, expiryYear, isDefault]
    );

    res.status(201).json({ card: result.rows[0] });
  } catch (error) {
    console.error('Add card error:', error);
    res.status(500).json({ error: 'Failed to add card' });
  }
};

export const getUserCards = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, last_four, card_holder_name, expiry_month, expiry_year, card_brand, is_default, created_at 
       FROM cards 
       WHERE user_id = $1 
       ORDER BY is_default DESC, created_at DESC`,
      [req.user!.id]
    );

    res.json({ cards: result.rows });
  } catch (error) {
    console.error('Get user cards error:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

export const setDefaultCard = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Verify card belongs to user
    const cardCheck = await client.query(
      'SELECT id FROM cards WHERE id = $1 AND user_id = $2',
      [id, req.user!.id]
    );

    if (cardCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Card not found' });
    }

    // Remove default from all user's cards
    await client.query(
      'UPDATE cards SET is_default = false WHERE user_id = $1',
      [req.user!.id]
    );

    // Set new default
    const result = await client.query(
      'UPDATE cards SET is_default = true WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    res.json({ card: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Set default card error:', error);
    res.status(500).json({ error: 'Failed to set default card' });
  } finally {
    client.release();
  }
};

export const deleteCard = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cards WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};
