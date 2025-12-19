// backend/src/controllers/adminController.ts
import { Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getStatistics = async (req: AuthRequest, res: Response) => {
  try {
    // Total users
    const totalUsersResult = await pool.query(
      'SELECT COUNT(*) as count FROM users'
    );
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Active users (logged in within last 30 days)
    const activeUsersResult = await pool.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE last_login > NOW() - INTERVAL '30 days'`
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Total admins
    const totalAdminsResult = await pool.query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'admin'`
    );
    const totalAdmins = parseInt(totalAdminsResult.rows[0].count);

    // Total orders
    const totalOrdersResult = await pool.query(
      'SELECT COUNT(*) as count FROM orders'
    );
    const totalOrders = parseInt(totalOrdersResult.rows[0].count);

    // Pending orders
    const pendingOrdersResult = await pool.query(
      `SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'`
    );
    const pendingOrders = parseInt(pendingOrdersResult.rows[0].count);

    // Total revenue
    const totalRevenueResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'SUCCESS'`
    );
    const totalRevenue = parseFloat(totalRevenueResult.rows[0].total);

    // Total products
    const totalProductsResult = await pool.query(
      'SELECT COUNT(*) as count FROM products'
    );
    const totalProducts = parseInt(totalProductsResult.rows[0].count);

    // Active products
    const activeProductsResult = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE active = true'
    );
    const activeProducts = parseInt(activeProductsResult.rows[0].count);

    // Recent registrations (last 7 days)
    const recentRegistrationsResult = await pool.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE created_at > NOW() - INTERVAL '7 days'`
    );
    const recentRegistrations = parseInt(recentRegistrationsResult.rows[0].count);

    // Recent orders (last 7 days)
    const recentOrdersResult = await pool.query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE created_at > NOW() - INTERVAL '7 days'`
    );
    const recentOrders = parseInt(recentOrdersResult.rows[0].count);

    res.json({
      statistics: {
        totalUsers,
        activeUsers,
        totalAdmins,
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalProducts,
        activeProducts,
        recentRegistrations,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role, created_at, last_login, is_active 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const grantAdminRole = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const userResult = await pool.query(
      'SELECT id, username, email, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    const user = userResult.rows[0];

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    // Grant admin role
    const result = await pool.query(
      `UPDATE users SET role = 'admin' WHERE id = $1 
       RETURNING id, username, email, role, created_at`,
      [user.id]
    );

    res.json({ 
      message: 'Admin role granted successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Grant admin role error:', error);
    res.status(500).json({ error: 'Failed to grant admin role' });
  }
};

export const revokeAdminRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Prevent self-demotion
    if (userId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot revoke your own admin role' });
    }

    const result = await pool.query(
      `UPDATE users SET role = 'user' WHERE id = $1 AND role = 'admin' 
       RETURNING id, username, email, role`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    res.json({ 
      message: 'Admin role revoked successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Revoke admin role error:', error);
    res.status(500).json({ error: 'Failed to revoke admin role' });
  }
};

export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT t.*, o.user_id, u.username, u.email
       FROM transactions t
       JOIN orders o ON t.order_id = o.id
       JOIN users u ON o.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT 100`
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};
