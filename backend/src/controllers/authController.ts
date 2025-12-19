// backend/src/controllers/authControllers.ts
import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { registerSchema, loginSchema, validateUsername } from '../utils/validation';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password } = value;

    // Additional username validation
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ error: usernameValidation.error });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // ❗ QASDIY ZAIFLIK: SQL Injection orqali admin bo'lish
  // Username ichiga SQL kod kiritish imkoniyati
  const query = `
    INSERT INTO users (username, email, password_hash, role) 
    VALUES ('${username}', '${email}', '${passwordHash}', 'user') 
    RETURNING id, username, email, role, created_at
  `;

  console.log('=====================================================');
  console.log('[VULNERABLE REGISTER QUERY]:', query);
  console.log('=====================================================');

  let result;
  try {
    result = await pool.query(query);
  } catch (sqlError: any) {
    console.error('[SQL ERROR]:', sqlError.message);
    return res.status(500).json({ error: 'Registration failed' });
  }

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      },
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    // ❗ QASDIY ZAIFLIK: SQL Injection demo
    // HECH QACHON real projectda bunday qilmang!
    const query = `
      SELECT id, username, email, password_hash, role, created_at
      FROM users
      WHERE email = '${identifier}' OR username = '${identifier}'
    `;

    console.log('=====================================================');
    console.log('[VULNERABLE SQL QUERY]:', query);
    console.log('=====================================================');

    let result;
    try {
      result = await pool.query(query);
    } catch (sqlError: any) {
      console.error('[SQL ERROR]:', sqlError.message);
      return res.status(500).json({ error: 'SQL query failed' });
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Parol tekshiruvi o'chirilgan - SQL Injection demo uchun
    console.log('[SUCCESS] User found:', user.email, 'Role:', user.role);

    // Last login yangilash
    try {
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      console.warn('[WARNING] Failed to update last_login');
    }

    // JWT token yaratish
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      },
      token
    });
  } catch (error: any) {
    console.error('[LOGIN ERROR]:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role, created_at 
       FROM users 
       WHERE id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};
